import { prisma, ScrapeAnalyticsCategory } from "libs/prisma";
import {
  makeAssignCategoryFlow,
  makeCategoryMakerFlow,
} from "./llm/flow-category";

export async function updateAnalytics(scrapeId: string) {
  const ONE_WEEK_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      createdAt: {
        gt: ONE_WEEK_AGO,
      },
    },
  });

  const userMessages = messages.filter(
    (m) => (m.llmMessage as any).role === "user"
  );

  const flow = makeCategoryMakerFlow(userMessages);
  while (await flow.stream({})) {}

  const message = JSON.parse(
    flow.getLastMessage().llmMessage.content as string
  );

  const categories = message.categories.map((cat: ScrapeAnalyticsCategory) => ({
    ...cat,
    messageIds: [],
  }));

  await prisma.scrape.update({
    where: { id: scrapeId },
    data: {
      analytics: {
        categories,
        updatedAt: new Date(),
      },
    },
  });

  return categories;
}

export async function assignCategory(scrapeId: string, messageId: string) {
  let scrape = await prisma.scrape.findFirstOrThrow({
    where: { id: scrapeId },
  });

  const message = await prisma.message.findFirstOrThrow({
    where: { id: messageId },
  });

  let categories = scrape.analytics?.categories;
  if (!categories) {
    categories = await updateAnalytics(scrapeId);
  }

  const flow = makeAssignCategoryFlow(
    categories!,
    message.llmMessage as string
  );

  while (await flow.stream({})) {}

  const categoryUpdate = JSON.parse(
    flow.getLastMessage().llmMessage.content as string
  );

  if (!categories!.find((c) => c.key === categoryUpdate.key)) {
    categories!.push({
      name: categoryUpdate.name,
      key: categoryUpdate.key,
      description: categoryUpdate.description,
      messageIds: [],
    });
  }

  for (let i = 0; i < categories!.length; i++) {
    if (categories![i].key === categoryUpdate.key) {
      categories![i].messageIds.push({ id: messageId });
      break;
    }
  }

  return await prisma.scrape.update({
    where: { id: scrapeId },
    data: {
      analytics: { categories, updatedAt: new Date() },
    },
  });
}
