import dotenv from "dotenv";
dotenv.config();

import { Agent, QueryPlannerAgent } from "./llm/agentic";
import { Flow } from "./llm/flow";
import { z } from "zod";

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
  const flow = new Flow(
    {
      "capital-finder": new CapitalFinder(),
    },
    {
      messages: [
        {
          llmMessage: {
            role: "user",
            content: "What is the capital of India?",
          },
          agentId: "capital-finder",
        },
      ],
    }
  );

  await flow.stream("capital-finder");
  await flow.stream("capital-finder");

  console.log(flow.getLastMessage().llmMessage.content);
}

console.log("Starting...");
main();
