import { ChatCompletionAssistantMessageParam } from "openai/resources/chat/completions";
import { FlowMessage, State } from "./agentic";
import { Agent } from "./agentic";
import { handleStream } from "./stream";

type FlowState<CustomState, CustomMessage> = {
  state: State<CustomState, CustomMessage>;
  startedAt?: number;
};

export class Flow<CustomState, CustomMessage> {
  private agents: Record<string, Agent<CustomState, CustomMessage>>;
  public flowState: FlowState<CustomState, CustomMessage>;

  constructor(
    agents: Record<string, Agent<CustomState, CustomMessage>>,
    state: State<CustomState, CustomMessage>
  ) {
    this.agents = agents;
    this.flowState = {
      state,
    };
  }

  getAgent(id: string) {
    return this.agents[id];
  }

  getLastMessage() {
    return this.flowState.state.messages[
      this.flowState.state.messages.length - 1
    ];
  }

  async runTool(id: string, toolName: string, args: Record<string, any>) {
    for (const [agentId, agent] of Object.entries(this.agents)) {
      const tools = agent.getTools();
      for (const [name, tool] of Object.entries(tools)) {
        if (name === toolName) {
          const { content, customMessage } = await tool.execute(args);
          this.flowState.state.messages.push({
            llmMessage: {
              role: "tool",
              content,
              tool_call_id: id,
            },
            agentId,
            custom: customMessage,
          });
          return content;
        }
      }
    }
    throw new Error(`Tool ${toolName} not found`);
  }

  isToolPending() {
    const lastMessage = this.getLastMessage();
    if (lastMessage.llmMessage && "tool_calls" in lastMessage.llmMessage) {
      return true;
    }
    return false;
  }

  hasStarted() {
    return this.flowState.startedAt !== undefined;
  }

  async stream(
    agentId: string,
    options?: { onDelta?: (content: string) => void }
  ) {
    if (!this.hasStarted()) {
      this.flowState.startedAt = Date.now();
    }

    const lastMessage = this.getLastMessage();
    if (lastMessage.llmMessage && "tool_calls" in lastMessage.llmMessage) {
      const message =
        lastMessage.llmMessage as ChatCompletionAssistantMessageParam;
      for (const toolCall of message.tool_calls!) {
        await this.runTool(
          toolCall.id,
          toolCall.function.name,
          JSON.parse(toolCall.function.arguments)
        );
      }
    }

    const result = await handleStream(
      await this.getAgent(agentId).stream(this.flowState.state),
      {
        onDelta: options?.onDelta,
      }
    );

    this.flowState.state.messages = [
      ...this.flowState.state.messages,
      ...result.messages.map((message) => ({
        llmMessage: message,
        agentId,
      })),
    ];

    return result;
  }

  addMessage(message: FlowMessage<CustomMessage>) {
    this.flowState.state.messages.push(message);
  }
}
