import dotenv from "dotenv";
dotenv.config();

import { cleanupThreads } from "./scripts/thread-cleanup";
import { multiLinePrompt, SimpleAgent, SimpleTool } from "./llm/agentic";
import { z } from "zod";
import { Flow } from "./llm/flow";
import { makeFlow, makeRagTool } from "./llm/flow-jasmine";
import { prisma } from "./prisma";
import { makeAssignCategoryFlow } from "./llm/flow-category";

async function main() {
  const scrapeId = "67d29ce750df5f4d86e1db33";

  const scrape = await prisma.scrape.findFirstOrThrow({
    where: { id: scrapeId },
  });

  const flow = makeFlow(
    scrape.id,
    scrape.chatPrompt ?? "",
    "What is CrawlChat and what are it's features?",
    [],
    scrape.indexer,
    {}
  );

  while (await flow.stream()) {}

  console.log(
    flow.flowState.state.messages.map((m) => [
      m.agentId,
      m.llmMessage.role,
      m.llmMessage.content,
    ])
  );
}

console.log("Starting...");
main();
