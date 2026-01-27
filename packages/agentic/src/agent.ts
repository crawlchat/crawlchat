import OpenAI from "openai";
import { z, ZodSchema } from "zod";
import { Stream } from "openai/streaming";
import { ChatCompletionMessageParam } from "openai/resources";
import { zodResponseFormat } from "openai/helpers/zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type Message = ChatCompletionMessageParam;
export type Tool<T extends ZodSchema<any>, CustomMessage> = {
  id: string;
  description: string;
  schema: T;
  execute: (
    input: z.infer<T>
  ) => Promise<{ content: string; customMessage?: CustomMessage }>;
};
export type Role = "developer" | "system" | "user" | "assistant" | "tool";

export function multiLinePrompt(prompt: string[]) {
  return prompt.join("\n");
}

export class Agent<CustomMessage = {}> {
  public id: string;
  public model: string;
  public tools?: Tool<any, CustomMessage>[];

  private openai: OpenAI;
  private prompt: string;
  private user?: string;
  private maxTokens?: number;
  private schema?: ZodSchema<any>;

  constructor({
    id,
    prompt,
    schema,
    tools,
    model,
    baseURL,
    apiKey,
    user,
    maxTokens,
  }: {
    id: string;
    prompt: string;
    schema?: ZodSchema<any>;
    tools?: Tool<any, CustomMessage>[];
    model?: string;
    baseURL?: string;
    apiKey?: string;
    user?: string;
    maxTokens?: number;
  }) {
    this.openai = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
      baseURL,
    });
    this.model = model ?? "gpt-4o-mini";
    this.id = id;
    this.user = user;
    this.maxTokens = maxTokens ?? 4000;
    this.prompt = prompt;
    this.schema = schema;
    this.tools = tools;

    console.log("Created agent", this.id, this.model);
  }

  async stream(
    messages: Message[]
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const systemPromptMessage: ChatCompletionMessageParam = {
      role: "system",
      content: this.prompt,
    };

    let developerMessages: ChatCompletionMessageParam[] = [];

    if (this.model === "o1-mini") {
      developerMessages = [
        {
          role: "developer",
          content: "Formatting re-enabled",
        } as ChatCompletionMessageParam,
      ];
    }

    const tools = this.tools?.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.id,
        description: tool.description,
        parameters: zodToJsonSchema(tool.schema),
      },
    }));

    return this.openai.chat.completions.create({
      messages: [...developerMessages, ...messages, systemPromptMessage],
      model: this.model,
      stream: true,
      response_format: this.schema
        ? zodResponseFormat(this.schema!, "json_object")
        : undefined,
      tools,
      user: this.user,
      max_tokens: this.maxTokens,
    });
  }
}
