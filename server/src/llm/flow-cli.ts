import readline from "readline";
import { FlowMessage } from "./agentic";
import { Flow } from "./flow";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function loopAsk(onAsk: (question: string) => Promise<void>) {
  rl.question(`----\nAsk > `, async (question) => {
    if (question.toLowerCase().includes("exit")) {
      rl.close();
      return;
    }
    await onAsk(question);
    loopAsk(onAsk);
  });
}

export async function loopFlowCli(
  flow: Flow<{ messages: FlowMessage<unknown>[] }, unknown>,
  getNextAgents: (agentId: string, messages: FlowMessage<unknown>[]) => string[]
) {
  loopAsk(async (question) => {
    flow.addMessage({
      llmMessage: {
        role: "user",
        content: question,
      },
    });
    let result;
    while ((result = await flow.stream())) {
      if (!flow.isToolPending()) {
        const lastMessage = flow.getLastMessage();
        console.log(`${result.agentId}: ${lastMessage.llmMessage.content}`);
        flow.addNextAgents(getNextAgents(result.agentId, result.messages));
      }
    }
  });
}
