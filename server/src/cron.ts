import dotenv from "dotenv";
dotenv.config();

import { prisma } from "libs/prisma";
import { makeKbProcesser } from "./kb/factory";
import { makeKbProcesserListener } from "./kb/listener";
import { exit } from "process";

async function updateKnowledgeGroup(groupId: string) {
  console.log(`Updating knowledge group ${groupId}`);

  const knowledgeGroup = await prisma.knowledgeGroup.findUnique({
    where: {
      id: groupId,
    },
  });

  if (!knowledgeGroup) {
    throw new Error(`Knowledge group ${groupId} not found`);
  }

  const scrape = await prisma.scrape.findFirst({
    where: {
      id: knowledgeGroup.scrapeId,
    },
    include: {
      user: true,
    },
  });

  if (!scrape) {
    throw new Error(`Scrape ${knowledgeGroup.scrapeId} not found`);
  }

  const listener = makeKbProcesserListener(scrape, knowledgeGroup);

  const processer = makeKbProcesser(listener, scrape, knowledgeGroup, {});

  try {
    await processer.start();
  } catch (error: any) {
    await listener.onComplete(error.message);
  }
}

async function updateKnowledgeBase() {
  const knowledgeGroups = await prisma.knowledgeGroup.findMany({
    where: {
      nextUpdateAt: {
        lte: new Date(),
        not: null,
      },
    },
  });

  console.log(`Found ${knowledgeGroups.length} knowledge groups to update`);

  for (const knowledgeGroup of knowledgeGroups) {
    if (["processing"].includes(knowledgeGroup.status)) {
      continue;
    }

    try {
      await updateKnowledgeGroup(knowledgeGroup.id);
    } catch (error) {
      console.log(`Error updating knowledge group ${knowledgeGroup.id}`);
      console.error(error);
    }
  }

  exit(0);
}

async function main() {
  await updateKnowledgeBase();
}

main();
