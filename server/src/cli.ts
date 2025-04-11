import dotenv from "dotenv";
dotenv.config();

import { cleanupThreads } from "./scripts/thread-cleanup";
import { getLimiter, wait } from "./rate-limiter";
import {
  getIssue,
  getIssues,
  getJustIssues,
  GithubPagination,
} from "./github-api";
import { SimpleAgent } from "./llm/agentic";
import { handleStream } from "./llm/stream";

async function main() {
  const agent = new SimpleAgent({
    id: "agent",
    prompt: "You are a helpful assistant.",
  });

  const stream = await agent.stream({
    messages: [
      {
        llmMessage: {
          role: "user",
          content: "Hello, how are you?",
        },
      },
    ],
  });

  const { content, messages } = await handleStream(stream);
  console.log(content);
  console.log(messages);
}

console.log("Starting...");
main();
