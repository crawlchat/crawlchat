import dotenv from "dotenv";
dotenv.config();

import { cleanupThreads } from "./scripts/thread-cleanup";
import { getLimiter, wait } from "./rate-limiter";
import { getIssues } from "./github-api";

async function main() {
  const issues = await getIssues({
    username: "remotion-dev",
    repo: "remotion",
  });

  console.log(issues);
}

console.log("Starting...");
main();
