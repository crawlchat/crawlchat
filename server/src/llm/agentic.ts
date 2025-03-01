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

export type FlowState<CustomState> = CustomState & {
  messages: {
    llmMessage: LlmMessage;
    agentId: string;
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
    state: FlowState<CustomState>
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

  async getSystemPrompt(state: FlowState<CustomState>): Promise<string> {
    return "You are a helpful assistant.";
  }

  getResponseSchema(): ZodSchema<any> | null {
    return null;
  }

  onMessage(message: LlmMessage): LlmMessage {
    return message;
  }
}

export async function handleStream<CustomState>(
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  agentId: string,
  state: FlowState<CustomState>,
  agents: Record<string, Agent<CustomState>>,
  options?: {
    onTool?: (options: {
      name: string;
      id: string;
      rawArguments: string;
      args: Record<string, any>;
    }) => Promise<string>;
    onDelta?: (content: string) => void;
  }
) {
  const toolCalls: Record<
    string,
    {
      id: string;
      name: string;
      rawArguments: string;
      llmToolCall: ChatCompletionMessageParam;
    }
  > = {};
  let content = "";
  let isTool = false;
  let role: LlmRole = "user";
  const messages: LlmMessage[] = [];

  for await (const chunk of stream) {
    if (chunk.choices[0].delta.role) {
      role = chunk.choices[0].delta.role;
    }

    if (chunk.choices[0].delta.content) {
      content += chunk.choices[0].delta.content;
    }

    if (chunk.choices[0].delta.tool_calls) {
      isTool = true;

      for (const toolCall of chunk.choices[0].delta.tool_calls) {
        if (!toolCall.function) {
          continue;
        }
        if (!toolCalls[toolCall.index]) {
          toolCalls[toolCall.index] = {
            id: toolCall.id!,
            name: toolCall.function.name!,
            rawArguments: "",
            llmToolCall: chunk.choices[0].delta as any,
          };
        }
        toolCalls[toolCall.index].rawArguments += toolCall.function.arguments;
      }
    }

    if (!isTool) {
      options?.onDelta?.(content);
    }
  }

  if (isTool) {
    if (!options?.onTool) {
      throw new Error("tool call received but no onTool callback provided");
    }

    for (const toolCall of Object.values(toolCalls)) {
      messages.push(toolCall.llmToolCall);
      const result = await options.onTool({
        name: toolCall.name,
        id: toolCall.id,
        rawArguments: toolCall.rawArguments,
        args: JSON.parse(toolCall.rawArguments),
      });
      messages.push({
        role: "tool",
        content: result,
        tool_call_id: toolCall.id,
      });
    }
  } else {
    messages.push({
      role,
      content,
    } as ChatCompletionAssistantMessageParam);
  }

  for (let i = 0; i < messages.length; i++) {
    messages[i] = agents[agentId].onMessage(messages[i]);
  }

  state.messages = [
    ...state.messages,
    ...messages.map((message) => ({
      llmMessage: message,
      agentId,
    })),
  ];

  return { content, messages, state };
}

export async function runTool<CustomState>(
  agents: Agent<CustomState>[],
  toolName: string,
  args: Record<string, any>
) {
  for (const agent of agents) {
    const tools = agent.getTools();
    if (tools[toolName]) {
      return tools[toolName].execute(args);
    }
  }
  throw new Error(`Tool ${toolName} not found`);
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
