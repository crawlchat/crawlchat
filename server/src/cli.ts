import dotenv from "dotenv";
import { Flow } from "./llm/flow";
import {
  Answerer,
  RAGAgent,
  RAGAgentCustomMessage,
  RAGState,
} from "./llm/rag-agent";
import { makeIndexer } from "./indexer/factory";
import { logMessage } from "./llm/agentic";
dotenv.config();

async function main() {
  const indexer = makeIndexer({ key: "mars" });
  const query =
    "how do I render a video in browser. I have a compoention playing with react player and now I want to add a button as download which will download the mp4 videp";

  const flow = new Flow<RAGState, RAGAgentCustomMessage>(
    {
      "rag-agent": new RAGAgent(indexer, "67d4402b50df5f4d86e1db36"),
      // "context-checker": new ContextCheckerAgent(),
      // "question-planner": new QuestionPlanner(),
      // "context-collector": new ContextCollector(
      //   indexer,
      //   "67c1d700cb1ec09c237bab8a"
      // ),
      // "next-question": new NextQuestion(query),
      answerer: new Answerer(query),
    },
    {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: query,
          },
        },
      ],
    }
  );
  flow.addNextAgents(["rag-agent", "answerer"]);
  while (await flow.stream()) {
    const message = flow.getLastMessage();
    console.log(message.agentId, flow.flowState.nextAgentIds);

    if (flow.isToolPending()) {
      continue;
    }

    // if (message.agentId === "context-collector") {
    //   const content = JSON.parse(message.llmMessage.content as string);
    //   flow.flowState.state.context += "\n" + content.result;
    //   if (flow.flowState.state.queries.length === 0) {
    //     flow.addNextAgents(["answerer"]);
    //   } else {
    //     flow.addNextAgents(["context-collector"]);
    //   }
    // }

    // if (message.agentId === "question-planner") {
    //   const content = JSON.parse(message.llmMessage.content as string);
    //   flow.flowState.state.queries = content.queries;
    // }
  }

  console.log(flow.getLastMessage().llmMessage.content);
}

console.log("Starting...");
main();
