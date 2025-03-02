import dotenv from "dotenv";
dotenv.config();

import { Agent, logMessage } from "./llm/agentic";
import { Flow } from "./llm/flow";
import { z } from "zod";
import { prisma } from "./prisma";
import { makeIndexer } from "./indexer/factory";
import { RAGAgent } from "./llm/rag-agent";

async function main() {
  const scrapeId = "67c1d700cb1ec09c237bab8a";

  const scrape = await prisma.scrape.findFirstOrThrow({
    where: {
      id: scrapeId,
    },
  });
  const indexer = makeIndexer({ key: scrape.indexer });

  const flow = new Flow(
    {
      "rag-agent": new RAGAgent(indexer, scrapeId),
    },
    {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: "How to find duration of a video?",
          },
        },
      ],
    }
  );

  while (!flow.hasStarted() || flow.isToolPending()) {
    await flow.stream("rag-agent");
    logMessage(flow.getLastMessage());
  }

  flow.addMessage({
    llmMessage: {
      role: "user",
      content: "How to wait the render till it is done?",
    },
  });

  while (!flow.hasStarted() || flow.isToolPending()) {
    await flow.stream("rag-agent");
    logMessage(flow.getLastMessage());
  }

  console.log(flow.flowState.state.messages.map((m) => m.custom));
}

console.log("Starting...");
main();
