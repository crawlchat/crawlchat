import {
  Message,
  MessageAnalysis,
  MessageSourceLink,
  prisma,
  QuestionSentiment,
} from "libs/prisma";
import { SimpleAgent } from "./agentic";
import { z } from "zod";
import { Flow } from "./flow";

export async function analyseMessage(
  question: string,
  answer: string,
  sources: MessageSourceLink[],
  context: string,
  messages: Message[]
) {
  const agent = new SimpleAgent({
    id: "analyser",
    prompt: `
    You are a helpful assistant that analyses a message and returns a message analysis.
    You need to analyse the question, answer and the sources provided and give back the details provided.

    <question>
    ${question}
    </question>

    <answer>
    ${answer}
    </answer>

    <sources>
    ${JSON.stringify(
      sources.map((s) => ({
        url: s.url,
        title: s.title,
        score: s.score,
        searchQuery: s.searchQuery,
      }))
    )}
    </sources>

    <context>
    ${context}
    </context>

    <previous-messages>
    ${messages
      .map(
        (m) => `${(m.llmMessage as any).role}: ${(m.llmMessage as any).content}`
      )
      .join("\n")}
    </previous-messages>
    `,
    schema: z.object({
      contextRelevanceScore: z.number().describe(`
          Given the context, answer and question, how relevant is the answer to the question?
          If there is no answer in the context, it should be 0 and vice versa.
          If the question is not mentioned in the context, it should be close to 0.
          If the answer says it has no answer, it should close to 0.
          It should be from 0 to 1.
        `),
      questionRelevanceScore: z.number().describe(
        `
          The relevance score of question to the context and previous messages.
          It is about relevance but not about having answer or not.
          Only if the question is relevant to the context, it should be close to 1.
          It should be from 0 to 1.
          `
      ),
      questionSentiment: z.nativeEnum(QuestionSentiment).describe(
        `
          The sentiment of the question.
          It should be one of the following: ${Object.values(
            QuestionSentiment
          ).join(", ")}
        `
      ),
      dataGapTitle: z.string().describe(
        `
          Make a title for the data gap (if any). It should be under 10 words and respresent the gap clearly.
          It is used to represent the data gap from the sources for the given question.
        `
      ),
      dataGapDescription: z.string().describe(
        `
          Make a description for the data gap (if any). It should be in markdown format.
          It should explain the details to be filled for the data gap.
          Make it descriptive, mention topics to fill as bullet points.
        `
      ),
    }),
  });

  const flow = new Flow([agent], {
    messages: [],
  });

  flow.addNextAgents(["analyser"]);

  await flow.stream();

  const content = flow.getLastMessage().llmMessage.content;

  if (!content) {
    return null;
  }

  return JSON.parse(content as string) as {
    questionRelevanceScore: number;
    contextRelevanceScore: number;
    questionSentiment: QuestionSentiment;
    dataGapTitle: string;
    dataGapDescription: string;
  };
}

function isDataGap(
  sources: MessageSourceLink[],
  questionRelevanceScore: number,
  contextRelevanceScore: number
) {
  const friction = {
    low: {
      questionRelevanceScore: 0.4,
      contextRelevanceScore: 0.6,
    },
    medium: {
      questionRelevanceScore: 0.5,
      contextRelevanceScore: 0.5,
    },
    high: {
      questionRelevanceScore: 0.6,
      contextRelevanceScore: 0.4,
    },
  };

  const frictionLevel = friction["high"];

  const avgScore =
    sources.reduce((acc, s) => acc + (s.score ?? 0), 0) / sources.length;
  const contextRelevanceScoreWeighted =
    avgScore * 0.5 + contextRelevanceScore * 0.5;

  return (
    // it actually searched the knowledge base
    sources.length > 0 &&
    // question is relevant to the context
    questionRelevanceScore >= frictionLevel.questionRelevanceScore &&
    // poor answer
    contextRelevanceScoreWeighted <= frictionLevel.contextRelevanceScore
  );
}

export async function fillMessageAnalysis(
  messageId: string,
  question: string,
  answer: string,
  sources: MessageSourceLink[],
  context: string
) {
  try {
    const message = await prisma.message.findFirstOrThrow({
      where: { id: messageId },
      include: {
        scrape: true,
      },
    });

    if (!message.scrape.analyseMessage) {
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        threadId: message.threadId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const partialAnalysis = await analyseMessage(
      question,
      answer,
      sources,
      context,
      messages
    );

    const dataGap =
      partialAnalysis &&
      isDataGap(
        sources,
        partialAnalysis.questionRelevanceScore,
        partialAnalysis.contextRelevanceScore
      );

    const analysis: MessageAnalysis = {
      contextRelevanceScore: partialAnalysis?.contextRelevanceScore ?? null,
      questionRelevanceScore: partialAnalysis?.questionRelevanceScore ?? null,
      questionSentiment: partialAnalysis?.questionSentiment ?? null,
      dataGapTitle: null,
      dataGapDescription: null,
      category: null,
      dataGapDone: false,
    };

    if (dataGap) {
      analysis.dataGapTitle = partialAnalysis?.dataGapTitle ?? null;
      analysis.dataGapDescription = partialAnalysis?.dataGapDescription ?? null;
    }

    console.log({ dataGap, analysis });

    await prisma.message.update({
      where: { id: messageId },
      data: {
        analysis,
      },
    });
  } catch (e) {
    console.error("Failed to analyse message", e);
  }
}
