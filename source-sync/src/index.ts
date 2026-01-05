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

    groupQueue.add("group", {
      scrapeId: knowledgeGroup.scrapeId,
      knowledgeGroupId: knowledgeGroup.id,
      userId: knowledgeGroup.userId,
      processId: uuidv4(),
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

    itemQueue.add("item", {
      scrapeItemId: scrapeItem.id,
      processId: uuidv4(),
      justThis: true,
    });

    res.json({ message: "ok" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});