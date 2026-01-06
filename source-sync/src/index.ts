import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Express, Request, Response } from "express";
import { authenticate, AuthMode, authoriseScrapeUser } from "libs/express-auth";
import "./worker";
import { Prisma, prisma } from "libs/dist/prisma";
import { v4 as uuidv4 } from "uuid";
import { scheduleGroup, scheduleUrl } from "./source/schedule";

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
      include: {
        scrape: {
          include: {
            user: true,
          },
        },
      },
    });

    authoriseScrapeUser(req.user!.scrapeUsers, knowledgeGroup.scrapeId, res);

    const processId = uuidv4();

    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroup.id },
      data: { updateProcessId: processId },
    });

    await scheduleGroup(knowledgeGroup, processId);

    res.json({ message: "ok" });
  }
);

app.post(
  "/update-item",
  authenticate,
  async function (req: Request, res: Response) {
    const scrapeItem = await prisma.scrapeItem.findFirstOrThrow({
      where: { id: req.body.scrapeItemId },
      include: {
        knowledgeGroup: {
          include: {
            scrape: {
              include: {
                user: true,
              },
            },
          },
        },
      },
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

    if (!scrapeItem.sourcePageId) {
      return res.status(400).json({ message: "Item has no source page id" });
    }

    await scheduleUrl(
      scrapeItem.knowledgeGroup!,
      processId,
      scrapeItem.url,
      scrapeItem.sourcePageId
    );

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

    res.json({ message: "ok" });
  }
);

app.post(
  "/text-page",
  authenticate,
  async function (req: Request, res: Response) {
    const { title, text, knowledgeGroupId, pageId } = req.body;

    const knowledgeGroup = await prisma.knowledgeGroup.findFirstOrThrow({
      where: { id: knowledgeGroupId },
      include: {
        scrape: {
          include: {
            user: true,
          },
        },
      },
    });

    authoriseScrapeUser(req.user!.scrapeUsers, knowledgeGroup.scrapeId, res);

    const processId = "default";

    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroupId },
      data: { status: "processing", updateProcessId: processId },
    });

    await scheduleUrl(knowledgeGroup, processId, pageId, pageId, {
      textPage: {
        title,
        text,
      },
    });

    res.json({ message: "ok" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
