import dotenv from "dotenv";
dotenv.config();

import { Agent, logMessage } from "./llm/agentic";
import { Flow } from "./llm/flow";
import { z } from "zod";
import { prisma } from "./prisma";
import { makeIndexer } from "./indexer/factory";
import { ContextCheckerAgent, RAGAgent } from "./llm/rag-agent";

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
      "context-checker-agent": new ContextCheckerAgent(),
    },
    {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: "How to increase the lambda concurrency?",
          },
        },
      ],
    }
  );

  flow.addNextAgents(["rag-agent"]);

  while (await flow.stream()) {
    logMessage(flow.getLastMessage().llmMessage);
  }
}

console.log("Starting...");
main();
