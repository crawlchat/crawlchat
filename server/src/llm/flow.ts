import { ChatCompletionAssistantMessageParam } from "openai/resources/chat/completions";
import { State } from "./agentic";
import { Agent } from "./agentic";
import { handleStream } from "./stream";

type FlowState<CustomState> = {
  state: State<CustomState>;
};

export class Flow<CustomState> {
  private agents: Record<string, Agent<CustomState>>;
  public flowState: FlowState<CustomState>;

  constructor(agents: Record<string, Agent<any>>, state: State<CustomState>) {
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
          const result = await tool.execute(args);
          this.flowState.state.messages.push({
            llmMessage: {
              role: "tool",
              content: result,
              tool_call_id: id,
            },
            agentId,
          });
          return result;
        }
      }
    }
    throw new Error(`Tool ${toolName} not found`);
  }

  async isToolPending() {
    const lastMessage = this.getLastMessage();
    if (lastMessage.llmMessage && "tool_calls" in lastMessage.llmMessage) {
      return true;
    }
    return false;
  }

  async stream(
    agentId: string,
    options?: { onDelta?: (content: string) => void }
  ) {
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

    for (const message of result.messages) {
      this.getAgent(agentId).onMessage(message);
    }

    this.flowState.state.messages = [
      ...this.flowState.state.messages,
      ...result.messages.map((message) => ({
        llmMessage: message,
        agentId,
      })),
    ];
  }
}
