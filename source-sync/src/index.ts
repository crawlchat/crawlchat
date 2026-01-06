import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Express, Request, Response } from "express";
import { authenticate, AuthMode, authoriseScrapeUser } from "libs/express-auth";
import "./worker";
import { Prisma, prisma } from "libs/dist/prisma";
import { groupQueue, itemQueue } from "./source/queue";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      user?: Prisma.UserGetPayload<{
        include: {
          scrapeUsers: true;
        };
      }>;
      authMode?: AuthMode;
    }
  }
}

const app: Express = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post(
  "/update-group",
  authenticate,
  async function (req: Request, res: Response) {
    const knowledgeGroup = await prisma.knowledgeGroup.findFirstOrThrow({
      where: { id: req.body.knowledgeGroupId },
    });

    authoriseScrapeUser(req.user!.scrapeUsers, knowledgeGroup.scrapeId, res);

    const processId = uuidv4();

    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroup.id },
      data: { updateProcessId: processId },
    });

    groupQueue.add("group", {
      scrapeId: knowledgeGroup.scrapeId,
      knowledgeGroupId: knowledgeGroup.id,
      userId: knowledgeGroup.userId,
      processId,
    });

    res.json({ message: "ok" });
  }
);

app.post(
  "/update-item",
  authenticate,
  async function (req: Request, res: Response) {
    const scrapeItem = await prisma.scrapeItem.findFirstOrThrow({
      where: { id: req.body.scrapeItemId },
    });

    authoriseScrapeUser(req.user!.scrapeUsers, scrapeItem.scrapeId, res);

    if (!scrapeItem.url) {
      return res.status(400).json({ message: "Item has no url" });
    }

    const processId = uuidv4();

    await prisma.knowledgeGroup.update({
      where: { id: scrapeItem.knowledgeGroupId },
      data: { updateProcessId: processId },
    });

    itemQueue.add("item", {
      processId,
      justThis: true,
      knowledgeGroupId: scrapeItem.knowledgeGroupId,
      url: scrapeItem.url,
    });

    res.json({ message: "ok" });
  }
);

app.post(
  "/stop-group",
  authenticate,
  async function (req: Request, res: Response) {
    const scrapeItem = await prisma.scrapeItem.findFirstOrThrow({
      where: { id: req.body.scrapeItemId },
    });

    authoriseScrapeUser(req.user!.scrapeUsers, scrapeItem.scrapeId, res);

    await prisma.knowledgeGroup.update({
      where: { id: scrapeItem.knowledgeGroupId },
      data: { updateProcessId: null },
    });

    await prisma.scrapeItem.deleteMany({
      where: {
        knowledgeGroupId: scrapeItem.knowledgeGroupId,
        status: "pending",
      },
    });

    res.json({ message: "ok" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
