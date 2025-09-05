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
  const apiKey = process.env.CALCOM_API_KEY!;
  // const me = await getMe(apiKey);
  // const bookings = await getBookings(apiKey);
  // const slots = await getSlots(apiKey);
  // const eventTypes = await getEventTypes(apiKey);
  // console.log(eventTypes.eventTypeGroups[0].eventTypes);

  // const booking = await createBooking(apiKey);

  // console.log(booking)
}

console.log("Starting...");
main();
