import dotenv from "dotenv";
dotenv.config();

import { prisma } from "@packages/common/prisma";
import { exit } from "process";
import { cleanupMessages } from "./cleanup";
import { createToken } from "@packages/common/jwt";
import { getNextUpdateTime } from "@packages/common/knowledge-group";

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

  const response = await fetch(`${process.env.SOURCE_SYNC_URL}/update-group`, {
    method: "POST",
    body: JSON.stringify({
      scrapeId: knowledgeGroup.scrapeId,
      knowledgeGroupId: knowledgeGroup.id,
      userId: scrape.userId,
    }),
    headers: {
      Authorization: `Bearer ${createToken(scrape.userId)}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to update knowledge group ${
        knowledgeGroup.id
      } - ${await response.text()}`
    );
  }

  await prisma.knowledgeGroup.update({
    where: { id: knowledgeGroup.id },
    data: {
      nextUpdateAt: getNextUpdateTime(
        knowledgeGroup.updateFrequency,
        new Date()
      ),
    },
  });
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

async function weeklyUpdate() {
  const scrapes = await prisma.scrape.findMany({
    include: {
      user: true,
    },
  });

  for (const scrape of scrapes) {
    if (
      !scrape.user.plan ||
      !scrape.user.plan.subscriptionId ||
      scrape.user.plan.status !== "ACTIVE"
    ) {
      continue;
    }

    console.log(`Sending weekly update for scrape ${scrape.id}`);
    const response = await fetch(`${process.env.FRONT_URL}/email-alert`, {
      method: "POST",
      body: JSON.stringify({
        intent: "weekly-update",
        scrapeId: scrape.id,
      }),
      headers: {
        Authorization: `Bearer ${createToken(scrape.userId)}`,
      },
    });
    if (!response.ok) {
      console.error(`Error sending weekly update for scrape ${scrape.id}`);
      console.error(response.statusText);
    }
  }
}

function getCliArg(argName: string): string | null {
  const args = process.argv;
  const argIndex = args.indexOf(`--${argName}`);

  if (argIndex !== -1 && argIndex + 1 < args.length) {
    return args[argIndex + 1];
  }

  return null;
}

async function main() {
  const jobName = getCliArg("job-name");

  if (jobName === "update-knowledge-base") {
    return await updateKnowledgeBase();
  }
  if (jobName === "cleanup-messages") {
    return await cleanupMessages();
  }
  if (jobName === "weekly-update") {
    return await weeklyUpdate();
  }

  console.error("Invalid job name", jobName);
  exit(1);
}

main();
