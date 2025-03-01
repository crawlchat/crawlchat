import OpenAI from "openai";
import { z, ZodSchema } from "zod";
import { Stream } from "openai/streaming";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
} from "openai/resources";
import { zodToJsonSchema } from "zod-to-json-schema";

export type LlmMessage = ChatCompletionMessageParam;
export type LlmTool<T extends ZodSchema<any>> = {
  description: string;
  schema: T;
  execute: (input: z.infer<T>) => Promise<string>;
};
export type LlmRole = "developer" | "system" | "user" | "assistant" | "tool";

abstract class AgentInterface {
  abstract getId(): string;
  abstract stream(
    messages: LlmMessage[]
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
}

export class DAgent extends AgentInterface {
  private id: string;
  private openai: OpenAI;
  private model: string;
  constructor(id: string) {
    super();
    this.id = id;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = "gpt-4o-mini";
  }

  async stream(
    messages: LlmMessage[]
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const systemPromptMessage: ChatCompletionMessageParam = {
      role: "system",
      content: this.getSystemPrompt(),
    };

    return this.openai.chat.completions.create({
      messages: [...messages, systemPromptMessage],
      model: this.model,
      stream: true,
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

  getId(): string {
    return this.id;
  }

  getTools(): Record<string, LlmTool<any>> {
    return {};
  }

  getSystemPrompt(): string {
    return "You are a helpful assistant.";
  }
}

export type FlowState = {
  messages: LlmMessage[];
};

export async function handleStream(
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  options?: {
    onTool?: (options: {
      name: string;
      id: string;
      rawArguments: string;
      args: Record<string, any>;
    }) => Promise<string>;
    onDelta?: (content: string) => void;
    state?: FlowState;
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

  if (options?.state) {
    options.state.messages = [...options.state.messages, ...messages];
  }

  return { content, messages, state: options?.state };
}

export async function runTool(
  agents: DAgent[],
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

export class InterviewerAgent extends DAgent {
  constructor(id: string) {
    super(id);
  }

  getSystemPrompt(): string {
    return `
Your name is Pramod.
You are interviewing a candidate for a job for a React Developer role.
Ask relevant questions to the candidate and evaluate their skills and experience.
Follow up on previous topics, ask follow up questions, ask deeper questions.
Keep your questions super short and concise.
Behave as if you are a human interviewer.`;
  }
}

export class CandidateAgent extends DAgent {
  constructor(id: string) {
    super(id);
  }

  getSystemPrompt(): string {
    return `
Your name is John Doe.
You are a candidate for a job for a React Developer role.
Answer the questions honestly and provide relevant examples.
Answer as if you are not so well prepared for the interview.
Keep your answers super short as if you are human.`;
  }
}
