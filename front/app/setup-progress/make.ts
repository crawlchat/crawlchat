import { prisma } from "libs/prisma";
import type { SetupProgressInput } from "./config";

export async function getSetupProgressInput(
  userId: string,
  scrapeId: string
): Promise<SetupProgressInput> {
  return {
    nScrapes: await prisma.scrape.count({
      where: {
        userId,
      },
    }),
    nScrapeItems: await prisma.scrapeItem.count({
      where: {
        scrapeId,
      },
    }),
    nMessages: await prisma.message.count({
      where: {
        scrapeId,
      },
    }),
    nTickets: await prisma.thread.count({
      where: {
        scrapeId,
        ticketStatus: "open",
      },
    }),
    nKnowledgeGroups: await prisma.knowledgeGroup.count({
      where: {
        scrapeId,
      },
    }),
    nChatbotMessages: await prisma.message.count({
      where: {
        scrapeId,
        channel: { isSet: false },
      },
    }),
    nDiscordMessages: await prisma.message.count({
      where: {
        scrapeId,
        channel: "discord",
      },
    }),
    nMCPMessages: await prisma.message.count({
      where: {
        scrapeId,
        channel: "mcp",
      },
    }),
    scrape: await prisma.scrape.findFirstOrThrow({
      where: {
        id: scrapeId,
      },
      include: {
        user: true,
      },
    }),
  };
}
