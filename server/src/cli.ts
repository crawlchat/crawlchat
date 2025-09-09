import dotenv from "dotenv";
import { SimpleAgent } from "./llm/agentic";
import { Flow } from "./llm/flow";
dotenv.config();

async function main() {
  const agent = new SimpleAgent({
    id: "test",
    prompt: "You are a test agent.",
  });
  const flow = new Flow([agent], {
    messages: [
      {
        llmMessage: {
          role: "user",
          content: [],
        },
      },
    ],
  });
  flow.addNextAgents(["test"]);
  await flow.stream();
  console.log(flow.getLastMessage().llmMessage.content);
}

console.log("Starting...");
main();
