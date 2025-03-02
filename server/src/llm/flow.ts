import { State, handleStream } from "./agentic";
import { Agent } from "./agentic";

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

  async stream(
    agentId: string,
    options?: { onDelta?: (content: string) => void }
  ) {
    return handleStream(
      await this.agents[agentId].stream(this.flowState.state),
      agentId,
      this.flowState.state,
      this.agents,
      {
        onTool: async (options) => {
          for (const agent of Object.values(this.agents)) {
            const tools = agent.getTools();
            for (const [name, tool] of Object.entries(tools)) {
              if (name === options.name) {
                return tool.execute(options.args);
              }
            }
          }
          throw new Error(`No agent found for tool ${options.name}`);
        },
        onDelta: options?.onDelta,
      }
    );
  }
}
