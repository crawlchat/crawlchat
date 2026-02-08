import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/byok-api-key";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";
import { encryptAiApiKey } from "@packages/common/ai-api-key";
import type { Prisma } from "@prisma/client";
import { prisma } from "@packages/common/prisma";

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  const update: Prisma.ScrapeUpdateInput = {};

  if (intent === "save") {
    const rawKey = formData.get("openrouterApiKey") as string;
    const encryptedKey = encryptAiApiKey(rawKey);
    update.openrouterApiKey = rawKey ? encryptedKey : null;
  }

  await prisma.scrape.update({
    where: { id: scrapeId },
    data: update,
  });

  return { success: true };
}
