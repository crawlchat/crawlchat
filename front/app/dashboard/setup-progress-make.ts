import { prisma } from "libs/prisma";
import type { SetupProgressInput } from "./setup-progress";

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
    nMessages: await prisma.message.count({
      where: {
        ownerUserId: userId,
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
        userId,
        scrapeId,
      },
    }),
    nChatbotMessages: await prisma.message.count({
      where: {
        ownerUserId: userId,
        scrapeId,
        channel: { isSet: false },
      },
    }),
    nDiscordMessages: await prisma.message.count({
      where: {
        ownerUserId: userId,
        scrapeId,
        channel: "discord",
      },
    }),
    nMCPMessages: await prisma.message.count({
      where: {
        ownerUserId: userId,
        scrapeId,
        channel: "mcp",
      },
    }),
    scrape: await prisma.scrape.findFirstOrThrow({
      where: {
        id: scrapeId,
      },
    }),
  };
}