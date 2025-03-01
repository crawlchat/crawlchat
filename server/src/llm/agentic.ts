import { Message } from "@prisma/client";
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

abstract class AgentInterface<T extends z.ZodTypeAny> {
  abstract makePrompt(messages: Message[]): Promise<string>;
  abstract getResponseSchema(): Promise<T>;

  abstract run(messages: Message[]): Promise<z.infer<T>>;
}

abstract class Agent<T extends z.ZodTypeAny> implements AgentInterface<T> {
  abstract makePrompt(messages: Message[]): Promise<string>;
  abstract getResponseSchema(): Promise<T>;

  async run(messages: Message[]): Promise<z.infer<T>> {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        ...messages.map((message) => message.llmMessage as any),
        {
          role: "system",
          content: await this.makePrompt(messages),
        },
      ],
      response_format: zodResponseFormat(
        await this.getResponseSchema(),
        "json_schema"
      ),
    });
    return completion.choices[0].message.parsed!;
  }
}

const QueryPlanSchema = z.object({
  query: z.string({
    description:
      "The query to be run on the vector database to fetch the context. Keep it short with keywords.",
  }),
});

export class QueryPlannerAgent extends Agent<typeof QueryPlanSchema> {
  private query: string;

  constructor(query: string) {
    super();
    this.query = query;
  }

  async getResponseSchema(): Promise<typeof QueryPlanSchema> {
    return QueryPlanSchema;
  }

  async makePrompt(messages: Message[]): Promise<string> {
    return `You are a helpful assistant that refines the query to be run on the vector database. Query to refine: "${this.query}".
`;
  }
}

const QuestionSplitSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      hasAnswer: z.boolean({
        description:
          "Whether the conversation already has answer for the question",
      }),
      isContextualQuestion: z.boolean({
        description:
          "Whether the question is contextual to the conversation. Generic conversation questions should be false. Ex: How are you? What is your name? etc. should be false.",
      }),
    })
  ),
});

export class QuestionSplitterAgent extends Agent<typeof QuestionSplitSchema> {
  async getResponseSchema(): Promise<typeof QuestionSplitSchema> {
    return QuestionSplitSchema;
  }

  async makePrompt(messages: Message[]): Promise<string> {
    return `You are a helpful assistant that splits a complex query into multiple questions. 
Each question should be independent and not related to the other questions.
Fill the hasAnswer field with true if you think the question has already been answered in the conversation.
Don't hallicunate. Don't ask new questions other than breaking down the query.

Question to be split: ${
      (messages[messages.length - 1].llmMessage as any)?.content
    }`;
  }
}

const AnswerSchema = z.object({
  answer: z.string(),
});

export class AnswerAgent extends Agent<typeof AnswerSchema> {
  async getResponseSchema(): Promise<typeof AnswerSchema> {
    return AnswerSchema;
  }

  async makePrompt(messages: Message[]): Promise<string> {
    return `You are a helpful assistant that answers the question based on the given above conversation.`;
  }
}

