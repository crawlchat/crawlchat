import { Worker, Job, QueueEvents } from "bullmq";
import { assertLimit } from "./assert-limit";
import { prisma } from "libs/prisma";
import { makeSource } from "./source/factory";
import { splitMarkdown } from "./scrape/markdown-splitter";
import { makeIndexer } from "./indexer/factory";
import { deleteByIds, makeRecordId } from "./pinecone";
import { v4 as uuidv4 } from "uuid";
import {
  ITEM_QUEUE_NAME,
  GROUP_QUEUE_NAME,
  GroupData,
  itemQueue,
  ItemWebData,
  redis,
} from "./source/queue";

const itemEvents = new QueueEvents(ITEM_QUEUE_NAME, {
  connection: redis,
});

async function checkCompletion(knowledgeGroupId: string) {
  const pendingItems = await prisma.scrapeItem.findMany({
    where: {
      knowledgeGroupId,
      status: "pending",
    },
  });

  if (pendingItems.length === 0) {
    await prisma.knowledgeGroup.update({
      where: { id: knowledgeGroupId },
      data: { status: "done" },
    });
  }
}

itemEvents.on("failed", async ({ jobId, failedReason }) => {
  const job = await itemQueue.getJob(jobId);
  if (job && job.failedReason && "scrapeItemId" in job.data) {
    const item = await prisma.scrapeItem.findUniqueOrThrow({
      where: { id: job.data.scrapeItemId },
    });

    await prisma.scrapeItem.update({
      where: { id: item.id },
      data: {
        status: "failed",
        error: failedReason,
      },
    });

    await checkCompletion(item.knowledgeGroupId);
  }
});

itemEvents.on("completed", async ({ jobId }) => {
  const job = await itemQueue.getJob(jobId);
  if (job && job.data && "scrapeItemId" in job.data) {
    const item = await prisma.scrapeItem.findUniqueOrThrow({
      where: { id: job.data.scrapeItemId },
    });
    await checkCompletion(item.knowledgeGroupId);
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
    const { itemIds } = await source.updateGroup(knowledgeGroup, data);
    for (const itemId of itemIds) {
      await itemQueue.add("item", {
        scrapeItemId: itemId,
        processId: data.processId,
      });
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

    const source = makeSource(item.knowledgeGroup.type);
    const { itemIds, page } = await source.updateItem(item, data);

    if (page) {
      const { text, title } = page;
      const chunks = await splitMarkdown(text, {
        context: item.knowledgeGroup.itemContext ?? undefined,
      });

      const path = item.url;

      if (!path) {
        throw new Error("Item has no url");
      }

      await assertLimit(
        path,
        chunks.length,
        item.scrapeId,
        item.userId,
        item.knowledgeGroup.scrape.user.plan
      );

      const indexer = makeIndexer({ key: item.knowledgeGroup.scrape.indexer });

      const documents = chunks.map((chunk) => ({
        id: makeRecordId(item.scrapeId, uuidv4()),
        text: chunk,
        metadata: { content: chunk, url: path },
      }));
      await indexer.upsert(item.scrapeId, documents);

      const existingItem = await prisma.scrapeItem.findFirst({
        where: { scrapeId: item.scrapeId, url: path },
      });
      if (existingItem) {
        await deleteByIds(
          indexer.getKey(),
          existingItem.embeddings.map((embedding) => embedding.id)
        );
      }

      await prisma.scrapeItem.update({
        where: { id: item.id },
        data: {
          markdown: text,
          title,
          metaTags: [],
          embeddings: documents.map((doc) => ({
            id: doc.id,
          })),
          status: "completed",
        },
      });
    }

    if (itemIds && !data.justThis && itemIds.length > 0) {
      for (const itemId of itemIds) {
        await itemQueue.add("item", {
          scrapeItemId: itemId,
          processId: data.processId,
        });
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
