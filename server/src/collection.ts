import { prisma } from "libs/prisma";
import { makeCategoryFlow } from "./llm/flow-category";

export async function updateAnalytics(scrapeId: string) {
  const scrape = await prisma.scrape.findFirstOrThrow({
    where: { id: scrapeId },
  });

  const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (scrape.analytics && scrape.analytics.updatedAt > ONE_DAY_AGO) {
    return;
  }

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

  const flow = makeCategoryFlow(messages);
  while (await flow.stream({})) {}

  const message = JSON.parse(
    flow.getLastMessage().llmMessage.content as string
  );

  await prisma.scrape.update({
    where: { id: scrapeId },
    data: {
      analytics: {
        categories: message.categories,
        updatedAt: new Date(),
      },
    },
  });
}
