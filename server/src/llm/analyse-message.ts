import { MessageSourceLink, QuestionSentiment, Scrape } from "libs/prisma";
import { SimpleAgent } from "./agentic";
import { z } from "zod";
import { Flow } from "./flow";
import { extractCitations } from "libs/citation";

export async function analyseMessage(
  question: string,
  answer: string,
  sources: MessageSourceLink[],
  context: string
) {
  const agent = new SimpleAgent({
    id: "analyser",
    prompt: `
    You are a helpful assistant that analyses a message and returns a message analysis.
    You need to analyse the question, answer and the sources provided and give back the details provided.

    Question: ${question}
    Answer: ${answer}
    Sources: ${JSON.stringify(
      sources.map((s) => ({
        url: s.url,
        title: s.title,
        score: s.score,
        searchQuery: s.searchQuery,
      }))
    )}
    Context: ${context}
    `,
    schema: z.object({
      questionRelevanceScore: z.number().describe(
        `
          The relevance score of question to the context.
          It is about relevance but not about having answer or not.
          Calculate the score based on the keywords in the query and the context.
          The more matching keywords, the better score.
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
      dataGapTitle: z
        .string()
        .describe(
          `
          Make a title for the data gap (if any). It should be under 10 words.
          It is used to represent the data gap from the sources for the given question.
        `
        )
        .optional(),
      dataGapDescription: z
        .string()
        .describe(
          `
          Make a description for the data gap (if any). It should be in markdown format.
          It should explain the details to be filled for the data gap.
          Make it descriptive, mention topics to fill as bullet points.
        `
        )
        .optional(),
    }),
  });

  const flow = new Flow([agent], {
    messages: [],
  });

  flow.addNextAgents(["analyser"]);

  await flow.stream();

  const content = flow.getLastMessage().llmMessage.content;

  if (!content) {
    throw new Error("Failed to analyse message");
  }

  return JSON.parse(content as string) as {
    questionRelevanceScore: number;
    questionSentiment: QuestionSentiment;
    dataGapTitle: string | null | undefined;
    dataGapDescription: string | null | undefined;
  };
}

function isDataGap(
  sources: MessageSourceLink[],
  questionRelevanceScore: number,
  bestCitedLinkScore: number
) {
  return (
    sources.length > 0 &&
    questionRelevanceScore !== null &&
    questionRelevanceScore >= 0.5 &&
    bestCitedLinkScore <= 0.3
  );
}

export async function fillMessageAnalysis(
  messageId: string,
  question: string,
  answer: string,
  sources: MessageSourceLink[],
  context: string,
  scrape: Scrape
) {
  try {
    const citations = extractCitations(answer, sources);
    const bestCitedLink = Object.values(citations.citedLinks).sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0)
    )[0];
    const bestCitedLinkScore = bestCitedLink?.score ?? 0;

    let {
      questionRelevanceScore,
      questionSentiment,
      dataGapTitle,
      dataGapDescription,
    } = await analyseMessage(question, answer, sources, context);

    if (!isDataGap(sources, questionRelevanceScore, bestCitedLinkScore)) {
      dataGapTitle = null;
      dataGapDescription = null;
    }

    console.log({
      bestCitedLinkScore,
      questionRelevanceScore,
      questionSentiment,
      dataGapTitle,
      dataGapDescription,
    });

    // await prisma.message.update({
    //   where: { id: messageId },
    //   data: {
    //     analysis,
    //   },
    // });
  } catch (e) {
    console.error("Failed to analyse message", e);
  }
}
