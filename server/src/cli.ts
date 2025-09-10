import dotenv from "dotenv";
import { SimpleAgent } from "./llm/agentic";
import { Flow } from "./llm/flow";
import { wsRateLimiter } from "./rate-limiter";
dotenv.config();

async function main() {
  for (let i = 0; i < 100; i++) {
    console.log(`Checking ${i}...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    wsRateLimiter.check();
  }
}

console.log("Starting...");
main();
