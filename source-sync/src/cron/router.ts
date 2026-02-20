import express, { Request, Response } from "express";
import { prisma } from "@packages/common/prisma";
import { v4 as uuidv4 } from "uuid";
import { getNextUpdateTime } from "@packages/common/knowledge-group";
import { scheduleGroup } from "../source/schedule";

async function updateKnowledgeGroup(groupId: string) {
  const knowledgeGroup = await prisma.knowledgeGroup.findUnique({
    where: {
      id: groupId,
    },
    include: {
      scrape: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!knowledgeGroup) {
    throw new Error(`Knowledge group ${groupId} not found`);
  }

  const processId = uuidv4();

  await prisma.knowledgeGroup.update({
    where: { id: knowledgeGroup.id },
    data: {
      status: "processing",
      updateProcessId: processId,
    },
  });

  await scheduleGroup(knowledgeGroup, processId);

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

async function updateKnowledgeBases() {
  const knowledgeGroups = await prisma.knowledgeGroup.findMany({
    where: {
      nextUpdateAt: {
        lte: new Date(),
        not: null,
      },
    },
  });

  const readyGroups = knowledgeGroups.filter(
    (knowledgeGroup) => knowledgeGroup.status !== "processing"
  );

  const results = await Promise.allSettled(
    readyGroups.map((knowledgeGroup) => updateKnowledgeGroup(knowledgeGroup.id))
  );

  const failed = results.filter(
    (result) => result.status === "rejected"
  ).length;

  return {
    found: knowledgeGroups.length,
    scheduled: readyGroups.length,
    failed,
  };
}

export const router = express.Router();

router.post(
  "/update-knowledge-base",
  async function (req: Request, res: Response) {
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && req.header("x-cron-secret") !== cronSecret) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await updateKnowledgeBases();

    res.json({ message: "ok", ...result });
  }
);
