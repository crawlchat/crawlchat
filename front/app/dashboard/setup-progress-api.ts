import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/setup-progress-api";
import { getSession } from "~/session";
import type { SetupProgressInput } from "./setup-progress";
import { prisma } from "libs/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request, { redirectTo: "/login" });

  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");

  const setupProgressInput: SetupProgressInput = {
    nScrapes: await prisma.scrape.count({
      where: {
        userId: user!.id,
      },
    }),
    nMessages: await prisma.message.count({
      where: {
        ownerUserId: user!.id,
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
        userId: user!.id,
        scrapeId,
      },
    }),
    nChatbotMessages: await prisma.message.count({
      where: {
        ownerUserId: user!.id,
        scrapeId,
        channel: { isSet: false },
      },
    }),
    nDiscordMessages: await prisma.message.count({
      where: {
        ownerUserId: user!.id,
        scrapeId,
        channel: "discord",
      },
    }),
    nMCPMessages: await prisma.message.count({
      where: {
        ownerUserId: user!.id,
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

  return {
    input: setupProgressInput,
  };
}
