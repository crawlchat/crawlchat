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
import { getConfig } from "./llm/config";

async function main() {
  const config = getConfig("gemini_2_5_flash");

  const agent = new SimpleAgent({
    id: "agent",
    prompt: "You are a helpful assistant.",
    ...config,
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
