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
import { decomposeQuestion, getRelevantScore } from "./llm/analyse-message";
import { prisma } from "libs/prisma";
import { baseAnswerer } from "./answer";
import { makeIndexer } from "./indexer/factory";

async function main() {
  const question1 =
    "how can i make a animation about sphere spinning, then explode from its inner core, then reverse time, and become back the original spinning perfect sphere?";
  const question2 = "is it normal that a video rendered in the <Video> has jitters if theres a lot of computation going on?";
  const question3 = "diplay console";
  const question4 = "How to identify center of dynamiz zoom?";
  const question8 = "can add gradient shapes";
  const question9 = "I want to color grade a video";

  const question5 = "How to preview Remotion player on Notion page?";
  const question6 = "I want to add a SidePanel (custom) to the Remotion Editor - how do you extend the UI and add in new panels?";
  const question7 = `Hey, I’m a bit confused about Remotion’s licensing and would appreciate some clarification.
Specifically, why does self‑hosted rendering incur additional costs with a Commercial license, while with the Free license you only pay the AWS Lambda fees?
Also, how are the development accounts accounted for and how does it differ between development accounts and normal usage`;

  const questions = await decomposeQuestion(question8);

  const scrape = await prisma.scrape.findFirstOrThrow({
    where: {
      id: "67c1d700cb1ec09c237bab8a",
    },
  });

  const score = await getRelevantScore(questions, scrape);
  console.log(score);
}

console.log("Starting...");
main();
