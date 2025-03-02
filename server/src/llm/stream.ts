import OpenAI from "openai";
import { Stream } from "openai/streaming";
import { ChatCompletionAssistantMessageParam } from "openai/resources";
import { Agent, LlmMessage, LlmRole, State } from "./agentic";

export async function handleStream<CustomState>(
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  agentId: string,
  state: State<CustomState>,
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
  let toolCall: ChatCompletionAssistantMessageParam | null = null;
  let content = "";
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
      if (!toolCall) {
        toolCall = chunk.choices[0].delta as any;
      }
      for (let i = 0; i < chunk.choices[0].delta.tool_calls.length; i++) {
        if (!chunk.choices[0].delta.tool_calls[i].function) {
          continue;
        }
        if (!toolCall || !toolCall.tool_calls) {
          continue;
        }

        const argChunk =
          chunk.choices[0].delta.tool_calls[i].function!.arguments;
        const index = chunk.choices[0].delta.tool_calls[i].index;
        toolCall.tool_calls[index].function.arguments += argChunk;
      }
    }

    if (!toolCall) {
      options?.onDelta?.(content);
    }
  }

  if (toolCall) {
    messages.push(toolCall);
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
