import OpenAI from "openai";
import { z, ZodSchema } from "zod";
import { Stream } from "openai/streaming";
import { ChatCompletionMessageParam } from "openai/resources";
import { zodResponseFormat } from "openai/helpers/zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type LlmMessage = ChatCompletionMessageParam;
export type LlmTool<T extends ZodSchema<any>, CustomMessage> = {
  description: string;
  schema: T;
  execute: (
    input: z.infer<T>
  ) => Promise<{ content: string; customMessage?: CustomMessage }>;
};
export type LlmRole = "developer" | "system" | "user" | "assistant" | "tool";
export type FlowMessage<CustomMessage> = {
  llmMessage: LlmMessage;
  agentId?: string;
  custom?: CustomMessage;
};

export type State<CustomState, CustomMessage> = CustomState & {
  messages: FlowMessage<CustomMessage>[];
};

export function multiLinePrompt(prompt: string[]) {
  return prompt.join("\n");
}

export function logMessage(message: any) {
  console.log(JSON.stringify(message, null, 2));
}

export class Agent<CustomState = {}, CustomMessage = {}> {
  private openai: OpenAI;
  private model: string;
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = "gpt-4o-mini";
  }

  async stream(
    state: State<CustomState, CustomMessage>
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const systemPromptMessage: ChatCompletionMessageParam = {
      role: "system",
      content: await this.getSystemPrompt(state),
    };

    const messages = [
      ...state.messages.map((m) => m.llmMessage),
      systemPromptMessage,
    ];

    const tools = this.getTools()
      ? Object.entries(this.getTools()!).map(([name, tool]) => ({
          type: "function" as const,
          function: {
            name,
            description: tool.description,
            parameters: zodToJsonSchema(tool.schema),
          },
        }))
      : undefined;

    return this.openai.chat.completions.create({
      messages,
      model: this.model,
      stream: true,
      response_format: this.getResponseSchema()
        ? zodResponseFormat(this.getResponseSchema()!, "json_object")
        : undefined,
      tools,
    });
  }

  getTools(): Record<string, LlmTool<any, CustomMessage>> | null {
    return null;
  }

  async getSystemPrompt(
    state: State<CustomState, CustomMessage>
  ): Promise<string> {
    return "You are a helpful assistant.";
  }

  getResponseSchema(): ZodSchema<any> | null {
    return null;
  }
}
