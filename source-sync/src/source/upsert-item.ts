import type { KnowledgeGroup, Scrape, UserPlan } from "libs/prisma";
import { splitMarkdown } from "../scrape/markdown-splitter";
import { assertLimit } from "../assert-limit";
import { makeIndexer } from "../indexer/factory";
import { deleteByIds, makeRecordId } from "../pinecone";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "libs/prisma";

export async function upsertItem(
  scrape: Scrape,
  knowledgeGroup: KnowledgeGroup,
  userPlan: UserPlan | null,
  url: string,
  sourcePageId: string,
  title: string,
  text: string
) {
  const chunks = await splitMarkdown(text, {
    context: knowledgeGroup.itemContext ?? undefined,
  });

  await assertLimit(
    url,
    chunks.length,
    knowledgeGroup.scrapeId,
    knowledgeGroup.userId,
    userPlan
  );

  const group = await prisma.knowledgeGroup.findUniqueOrThrow({
    where: { id: knowledgeGroup.id },
    include: {
      scrape: true,
    },
  });

  if (group.status !== "processing") {
    return;
  }

  console.log(`Upserting item ${url} with ${chunks.length} chunks`);

  const indexer = makeIndexer({ key: scrape.indexer });

  const documents = chunks.map((chunk) => ({
    id: makeRecordId(scrape.id, uuidv4()),
    text: chunk,
    metadata: { content: chunk, url: url },
  }));
  await indexer.upsert(scrape.id, documents);

  const existingItem = await prisma.scrapeItem.findFirst({
    where: { scrapeId: scrape.id, url },
  });
  if (existingItem) {
    await deleteByIds(
      indexer.getKey(),
      existingItem.embeddings.map((embedding) => embedding.id)
    );
  }

  await prisma.scrapeItem.upsert({
    where: {
      knowledgeGroupId_url: { knowledgeGroupId: knowledgeGroup.id, url },
    },
    update: {
      markdown: text,
      title,
      metaTags: [],
      embeddings: documents.map((doc) => ({
        id: doc.id,
      })),
      status: "completed",
      sourcePageId,
    },
    create: {
      userId: knowledgeGroup.userId,
      knowledgeGroupId: knowledgeGroup.id,
      scrapeId: scrape.id,
      url,
      sourcePageId,
      status: "completed",
      title,
      markdown: text,
      metaTags: [],
    },
  });
}

export async function upsertFailedItem(
  knowledgeGroupId: string,
  url: string,
  error: string
) {
  const knowledgeGroup = await prisma.knowledgeGroup.findFirstOrThrow({
    where: { id: knowledgeGroupId },
    include: {
      scrape: true,
    },
  });

  if (knowledgeGroup.status !== "processing") {
    return;
  }

  await prisma.scrapeItem.upsert({
    where: {
      knowledgeGroupId_url: {
        knowledgeGroupId: knowledgeGroupId,
        url,
      },
    },
    update: {
      status: "failed",
      error,
    },
    create: {
      userId: knowledgeGroup.scrape.userId,
      scrapeId: knowledgeGroup.scrape.id,
      knowledgeGroupId: knowledgeGroupId,
      url,
      status: "failed",
      error,
    },
  });
}
