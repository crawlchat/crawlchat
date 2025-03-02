import dotenv from "dotenv";
dotenv.config();

import { QueryPlannerAgent } from "./llm/agentic";
import { Flow } from "./llm/flow";

async function main() {
  const flow = new Flow(
    {
      "query-planner": new QueryPlannerAgent(),
    },
    {
      query: "What is the capital of the moon?",
      messages: [],
    }
  );

  const result = await flow.stream("query-planner");

  console.log(result);
}

console.log("Starting...");
main();
