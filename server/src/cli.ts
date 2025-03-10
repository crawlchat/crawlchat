import dotenv from "dotenv";
dotenv.config();

import { prisma } from "libs/prisma";
import { cleanupThreads } from "./scripts/thread-cleanup";

async function main() {
  const scrapes = await prisma.scrape.findMany();
  const scrapeItems = await prisma.scrapeItem.findMany();
  console.log(scrapeItems);
}

console.log("Starting...");
// main();
cleanupThreads();