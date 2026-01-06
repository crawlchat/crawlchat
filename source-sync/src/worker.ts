import { Worker, Job, QueueEvents } from "bullmq";
import { prisma } from "libs/prisma";
import { makeSource } from "./source/factory";
import {
  ITEM_QUEUE_NAME,
  GROUP_QUEUE_NAME,
  GroupData,
  itemQueue,
  ItemWebData,
  redis,
} from "./source/queue";
import { upsertItem } from "./source/upsert-item";

const itemEvents = new QueueEvents(ITEM_QUEUE_NAME, {
  connection: redis,
});

async function checkCompletion(knowledgeGroupId: string) {
  const pendingItems = await prisma.scrapeItem.findMany({
    where: {
      knowledgeGroupId,
      willUpdate: true,
    },
  });

  if (pendingItems.length === 0) {
    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroupId },
      data: { status: "done" },
    });
    console.log(`Knowledge group ${knowledgeGroupId} completed`);
  }

  const knowledgeGroup = await prisma.knowledgeGroup.findFirst({
    where: { id: knowledgeGroupId },
  });

  if (!knowledgeGroup) {
    return;
  }

  if (knowledgeGroup.status !== "processing") {
    await prisma.scrapeItem.deleteMany({
      where: {
        knowledgeGroupId,
        status: "pending",
      },
    });

    await prisma.scrapeItem.updateMany({
      where: {
        knowledgeGroupId,
        willUpdate: true,
      },
      data: {
        willUpdate: false,
      },
    });

    const jobs = await itemQueue.getJobs(["delayed", "waiting"]);
    for (const job of jobs) {
      if (job.data.knowledgeGroupId === knowledgeGroupId) {
        console.log(`Removing job ${job.id} of type ${job.name}`);
        job.remove().catch(console.error);
      }
    }
  }
}

itemEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await itemQueue.getJob(jobId);
  if (job && job.failedReason && "scrapeItemId" in job.data) {
    const item = await prisma.scrapeItem.findFirst({
      where: { id: job.data.scrapeItemId },
    });

    if (!item) {
      return;
    }

    await prisma.scrapeItem.update({
      where: { id: item.id },
      data: {
        status: "failed",
        error: failedReason,
        willUpdate: false,
      },
    });

    await checkCompletion(job.data.knowledgeGroupId);
  }
});

itemEvents.on("completed", async ({ jobId }) => {
  const job = await itemQueue.getJob(jobId);
  if (job) {
    await checkCompletion(job.data.knowledgeGroupId);
  }
});

const groupWorker = new Worker<GroupData>(
  GROUP_QUEUE_NAME,
  async (job: Job<GroupData>) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

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

    const source = makeSource(knowledgeGroup.type);
    const { itemIds, pages } = await source.updateGroup(knowledgeGroup, data);

    if (pages && pages.length > 0) {
      for (const page of pages) {
        await upsertItem(
          knowledgeGroup.scrape,
          knowledgeGroup,
          knowledgeGroup.scrape.user.plan,
          page.url,
          page.title,
          page.text
        );
      }
    }

    for (const itemId of itemIds) {
      await itemQueue.add(
        "item",
        {
          scrapeItemId: itemId,
          processId: data.processId,
          knowledgeGroupId: data.knowledgeGroupId,
        },
        { delay: source.getDelay() }
      );
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

const itemWorker = new Worker<ItemWebData>(
  ITEM_QUEUE_NAME,
  async (job: Job<ItemWebData>) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    const data = job.data;

    const item = await prisma.scrapeItem.findFirstOrThrow({
      where: { id: data.scrapeItemId },
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

    if (!item.knowledgeGroup) {
      throw new Error("Item has no knowledge group");
    }
    if (!item.url) {
      throw new Error("Item has no url");
    }

    const source = makeSource(item.knowledgeGroup.type);
    const { itemIds, page } = await source.updateItem(item, data);

    if (page) {
      await upsertItem(
        item.knowledgeGroup.scrape,
        item.knowledgeGroup,
        item.knowledgeGroup.scrape.user.plan,
        item.url,
        page.title,
        page.text
      );
    }

    if (itemIds && !data.justThis && itemIds.length > 0) {
      for (const itemId of itemIds) {
        await itemQueue.add(
          "item",
          {
            scrapeItemId: itemId,
            processId: data.processId,
            knowledgeGroupId: data.knowledgeGroupId,
          },
          { delay: source.getDelay() }
        );
      }
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

console.log("KB Worker started, waiting for jobs...");

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await groupWorker.close();
  await itemWorker.close();
  await itemEvents.close();
  await redis.quit();
  process.exit(0);
});
