import dotenv from "dotenv";
dotenv.config();

import { prisma } from "libs/prisma";

async function main() {
  const scrapes = await prisma.scrape.findMany();
  const scrapeItems = await prisma.scrapeItem.findMany();
  console.log(scrapeItems);
}

console.log("Starting...");
main();
