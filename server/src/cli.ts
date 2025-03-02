import dotenv from "dotenv";
dotenv.config();

import { Agent, logMessage, QueryPlannerAgent } from "./llm/agentic";
import { Flow } from "./llm/flow";
import { z } from "zod";
import { prisma } from "./prisma";
import { makeIndexer } from "./indexer/factory";
import { RAGAgent } from "./llm/rag-agent";

class CapitalFinder extends Agent<{ country: string }> {
  getTools() {
    return {
      find_capital: {
        schema: z.object({
          country: z.string(),
        }),
        description: "Find the capital of a country",
        execute: async ({ country }: { country: string }) => {
          return `The capital of ${country} is New Delhi`;
        },
      },
    };
  }

  async getSystemPrompt() {
    return "You are a helpful assistant that can find the capital of a country.";
  }
}

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
}

console.log("Starting...");
main();
