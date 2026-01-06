import { Worker, Job, QueueEvents } from "bullmq";
import { prisma } from "libs/prisma";
import { makeSource } from "./source/factory";
import {
  ITEM_QUEUE_NAME,
  GROUP_QUEUE_NAME,
  GroupData,
  itemQueue,
  ItemData,
  redis,
  groupQueue,
} from "./source/queue";
import { upsertItem } from "./source/upsert-item";
import { decrementPendingUrls, getPendingUrls } from "./source/schedule";

const itemEvents = new QueueEvents(ITEM_QUEUE_NAME, {
  connection: redis,
});

const groupEvents = new QueueEvents(GROUP_QUEUE_NAME, {
  connection: redis,
});

groupEvents.on("added", async ({ jobId }) => {
  console.log(`Group job added: ${jobId}`);
});

groupEvents.on("failed", async ({ jobId, failedReason }) => {
  console.log(`Group job failed: ${jobId}, failed reason: ${failedReason}`);
});

async function checkCompletion(processId: string, knowledgeGroupId: string) {
  await decrementPendingUrls(processId);
  const pendingUrls = await getPendingUrls(processId);

  if (pendingUrls === 0) {
    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroupId },
      data: { status: "done" },
    });
    console.log(`Knowledge group ${knowledgeGroupId} completed`);
  }
}

itemEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await itemQueue.getJob(jobId);
  if (job) {
    const knowledgeGroup = await prisma.knowledgeGroup.findFirstOrThrow({
      where: { id: job.data.knowledgeGroupId },
      include: {
        scrape: true,
      },
    });

    await prisma.scrapeItem.upsert({
      where: {
        knowledgeGroupId_url: {
          knowledgeGroupId: job.data.knowledgeGroupId,
          url: job.data.url,
        },
      },
      update: {
        status: "failed",
        error: failedReason,
      },
      create: {
        userId: knowledgeGroup.scrape.userId,
        scrapeId: knowledgeGroup.scrape.id,
        knowledgeGroupId: job.data.knowledgeGroupId,
        url: job.data.url,
        status: "failed",
        error: failedReason,
      },
    });

    await checkCompletion(job.data.processId, job.data.knowledgeGroupId);
  }
});

itemEvents.on("completed", async ({ jobId }) => {
  const job = await itemQueue.getJob(jobId);
  if (job) {
    await checkCompletion(job.data.processId, job.data.knowledgeGroupId);
  }
});

const groupWorker = new Worker<GroupData>(
  GROUP_QUEUE_NAME,
  async (job: Job<GroupData>) => {
    const data = job.data;

    const knowledgeGroup = await prisma.knowledgeGroup.findFirstOrThrow({
      where: { id: data.knowledgeGroupId },
      include: {
        scrape: {
          include: {
            user: true,
          },
        },
      },
    });

    if (knowledgeGroup.updateProcessId !== data.processId) {
      return;
    }

    const source = makeSource(knowledgeGroup.type);
    await source.updateGroup(data, knowledgeGroup);
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

const itemWorker = new Worker<ItemData>(
  ITEM_QUEUE_NAME,
  async (job: Job<ItemData>) => {
    const data = job.data;

    const knowledgeGroup = await prisma.knowledgeGroup.findFirstOrThrow({
      where: { id: data.knowledgeGroupId },
      include: {
        scrape: {
          include: {
            user: true,
          },
        },
      },
    });

    if (knowledgeGroup.updateProcessId !== data.processId) {
      return;
    }

    const source = makeSource(knowledgeGroup.type);
    const { page } = await source.updateItem(data, knowledgeGroup);

    if (page) {
      await upsertItem(
        knowledgeGroup.scrape,
        knowledgeGroup,
        knowledgeGroup.scrape.user.plan,
        data.url,
        page.title,
        page.text
      );
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

console.log("sync-worker started");

process.on("SIGTERM", async () => {
  console.log("sync-worker shutting down");
  await groupWorker.close();
  await itemWorker.close();
  await itemEvents.close();
  await redis.quit();
  process.exit(0);
});
