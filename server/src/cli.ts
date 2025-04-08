import dotenv from "dotenv";
dotenv.config();

import { cleanupThreads } from "./scripts/thread-cleanup";
import { getLimiter, wait } from "./rate-limiter";
import { getIssue, getIssues, GithubPagination } from "./github-api";

async function main() {
  const issue = await getIssue({
    username: "remotion-dev",
    repo: "remotion",
    issueNumber: 5071,
  });
  console.log(issue);
}

console.log("Starting...");
main();
