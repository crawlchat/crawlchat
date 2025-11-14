import {
  KnowledgeGroup,
  Prisma,
  prisma,
  Scrape,
  User,
  UserPlan,
} from "libs/prisma";
import { getNextUpdateTime } from "libs/knowledge-group";
import { KbContent, KbProcesserListener } from "./kb-processer";
import { makeIndexer } from "../indexer/factory";
import { splitMarkdown } from "../scrape/markdown-splitter";
import { deleteByIds, makeRecordId } from "../scrape/pinecone";
import { v4 as uuidv4 } from "uuid";
import { getPagesCount, PLAN_FREE } from "libs/user-plan";

export const assertLimit = async (
  url: string,
  n: number,
  scrapeId: string,
  userId: string,
  userPlan: UserPlan | null
) => {
  const existingItem = await prisma.scrapeItem.findFirst({
    where: { scrapeId: scrapeId, url },
  });
  if (existingItem) {
    console.log("Existing item", url);
    return;
  }

  const limit = userPlan?.limits?.pages ?? PLAN_FREE.limits.pages;
  const pagesCount = await getPagesCount(userId);
  console.log("Pages count", pagesCount, n, limit);
  if (pagesCount + n <= limit) {
    return;
  }
  throw new Error("Pages limit reached for the plan");
};

async function onError(
  path: string,
  title: string,
  error: string,
  knowledgeGroup: KnowledgeGroup,
  scrape: Prisma.ScrapeGetPayload<{ include: { user: true } }>
) {
  await prisma.scrapeItem.upsert({
    where: {
      knowledgeGroupId_url: {
        knowledgeGroupId: knowledgeGroup.id,
        url: path,
      },
    },
    update: {
      status: "failed",
      error,
    },
    create: {
      userId: scrape.userId,
      scrapeId: scrape.id,
      knowledgeGroupId: knowledgeGroup.id,
      url: path,
      markdown: "Not available",
      title,
      status: "failed",
      error,
    },
  });
}

async function onChunksAvailable(
  path: string,
  content: KbContent,
  chunks: string[],
  knowledgeGroup: KnowledgeGroup,
  scrape: Prisma.ScrapeGetPayload<{ include: { user: true } }>
) {
  const indexer = makeIndexer({ key: scrape.indexer });

  const documents = chunks.map((chunk) => ({
    id: makeRecordId(scrape.id, uuidv4()),
    text: chunk,
    metadata: { content: chunk, url: path },
  }));
  await indexer.upsert(scrape.id, documents);

  const existingItem = await prisma.scrapeItem.findFirst({
    where: { scrapeId: scrape.id, url: path },
  });
  if (existingItem) {
    await deleteByIds(
      indexer.getKey(),
      existingItem.embeddings.map((embedding) => embedding.id)
    );
  }

  await prisma.scrapeItem.upsert({
    where: {
      knowledgeGroupId_url: {
        knowledgeGroupId: knowledgeGroup.id,
        url: path,
      },
    },
    update: {
      markdown: content.text,
      title: content.title,
      metaTags: content.metaTags,
      embeddings: documents.map((doc) => ({
        id: doc.id,
      })),
      status: "completed",
    },
    create: {
      userId: scrape.userId,
      scrapeId: scrape.id,
      knowledgeGroupId: knowledgeGroup.id,
      url: path,
      markdown: content.text,
      title: content.title,
      metaTags: content.metaTags,
      embeddings: documents.map((doc) => ({
        id: doc.id,
      })),
      status: "completed",
    },
  });
}

export function makeKbProcesserListener(
  scrape: Scrape & { user: User },
  knowledgeGroup: KnowledgeGroup
): KbProcesserListener {
  return {
    async onBeforeStart() {
      await prisma.knowledgeGroup.update({
        where: { id: knowledgeGroup.id },
        data: { status: "processing" },
      });
    },

    async onComplete(error?: string) {
      await prisma.knowledgeGroup.update({
        where: { id: knowledgeGroup.id },
        data: {
          status: "done",
          fetchError: error,
          lastUpdatedAt: new Date(),
          nextUpdateAt: getNextUpdateTime(
            knowledgeGroup.updateFrequency,
            new Date()
          ),
        },
      });
    },

    async onError(path: string, error: any) {
      const errorMessage = `${error.message.toString()}\n\n${error.stack}`;
      await onError(path, "Error", errorMessage, knowledgeGroup, scrape);
    },

    async onContentAvailable(path: string, content: KbContent) {
      if (content.error) {
        onError(
          path,
          content.title ?? "Error",
          content.error,
          knowledgeGroup,
          scrape
        );
        return;
      }

      const chunks = await splitMarkdown(content.text, {
        context: knowledgeGroup.itemContext ?? undefined,
      });

      await assertLimit(
        path,
        chunks.length,
        scrape.id,
        scrape.userId,
        scrape.user.plan
      );

      try {
        await onChunksAvailable(path, content, chunks, knowledgeGroup, scrape);
      } catch (error: any) {
        console.error("Error while saving content", error);
        await onError(
          path,
          "Error while saving content",
          error?.message?.toString() ?? "Unknown error",
          knowledgeGroup,
          scrape
        );
      }
    },
  };
}
