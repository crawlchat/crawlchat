import OpenAI from "openai";
import { z, ZodSchema } from "zod";
import { Stream } from "openai/streaming";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
} from "openai/resources";
import { zodResponseFormat } from "openai/helpers/zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type LlmMessage = ChatCompletionMessageParam;
export type LlmTool<T extends ZodSchema<any>> = {
  description: string;
  schema: T;
  execute: (input: z.infer<T>) => Promise<string>;
};
export type LlmRole = "developer" | "system" | "user" | "assistant" | "tool";

export type State<CustomState> = CustomState & {
  messages: {
    llmMessage: LlmMessage;
    agentId?: string;
  }[];
};

export class Agent<CustomState> {
  private openai: OpenAI;
  private model: string;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = "gpt-4o-mini";
  }

  async stream(
    state: State<CustomState>
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const systemPromptMessage: ChatCompletionMessageParam = {
      role: "system",
      content: await this.getSystemPrompt(state),
    };

    return this.openai.chat.completions.create({
      messages: [
        ...state.messages.map((m) => m.llmMessage),
        systemPromptMessage,
      ],
      model: this.model,
      stream: true,
      response_format: this.getResponseSchema()
        ? zodResponseFormat(this.getResponseSchema()!, "json_object")
        : undefined,
      tools: Object.entries(this.getTools()).map(([name, tool]) => ({
        type: "function",
        function: {
          name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.schema),
        },
      })),
    });
  }

  getTools(): Record<string, LlmTool<any>> {
    return {};
  }

  async getSystemPrompt(state: State<CustomState>): Promise<string> {
    return "You are a helpful assistant.";
  }

  getResponseSchema(): ZodSchema<any> | null {
    return null;
  }

  onMessage(message: LlmMessage): LlmMessage {
    return message;
  }
}

export class QueryPlannerAgent extends Agent<{ query: string }> {
  getTools() {
    return {};
  }

  async getSystemPrompt({ query }: { query: string }) {
    return `You are a helpful assistant that refines the query to be run on the vector database. Query to refine: "${query}"`;
  }

  getResponseSchema() {
    return z.object({
      query: z.string({
        description:
          "The query to be run on the vector database to fetch the context. Keep it short with keywords.",
      }),
    });
  }
}
