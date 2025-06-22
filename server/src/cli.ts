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
import { loopFlowCli } from "./llm/flow-cli";
import { Flow } from "./llm/flow";
import { z } from "zod";
import { makeRagTool } from "./llm/flow-jasmine";

async function main() {
  const ragTool = makeRagTool("67c1d700cb1ec09c237bab8a", "mars").make();

  const maker = new SimpleAgent({
    id: "maker",
    prompt: `
    You are a helpful assistant. 
    You need to answer the asked question.
    Use the rag tool to search for relevant information.
    If you don't have context, shorten the query that you use for the rag too and try again.
    Dont just try to answer the question, if you need more information, you may ask the user to provide more information.
`,
    tools: [ragTool],
  });

  const checker = new SimpleAgent({
    id: "checker",
    prompt: `
      You are a helpful assistant.
      Check if the question has been answered.
      If there is no context, it means the question has not been answered.
`,
    schema: z.object({
      answered: z.boolean(),
    }),
  });

  const flow = new Flow([maker, checker], {
    messages: [
      {
        llmMessage: {
          role: "user",
          content: `
            Hello Everyone,

I hope you’re doing well.

We’re currently integrating Remotion into a ReactJS service using the Hono framework, running on a GPU-enabled VM instance on GCP. We’ve observed a significant performance drop when using Remotion as a library within this service compared to running the same rendering tasks directly via the remotion-cli on the same machine.

For example:

Remotion CLI (GPU VM): A 60s video renders in ~3 minutes.
ReactJS + Hono Service (GPU VM): The same video takes ~12-15 minutes, sometimes more.
            `,
        },
      },
    ],
  });

  flow.addNextAgents(["maker"]);
  while (await flow.stream()) {}
  console.log(flow.getLastMessage().llmMessage.content);

  // await loopFlowCli(flow, (agentId, messages) => {
  //   if (agentId === "checker") {
  //     const checkerMessage = JSON.parse(
  //       messages[messages.length - 1].llmMessage.content as string
  //     );
  //     if (!checkerMessage.sufficient) {
  //       return ["maker", "checker"];
  //     }
  //     return ["maker"];
  //   }
  //   return [];
  // });
}

console.log("Starting...");
main();
