import type { Scrape, Thread } from "libs/prisma";

export function sanitizeScrape(scrape: Scrape) {
  scrape.slackConfig = null;
  scrape.slackTeamId = null;
  scrape.discordDraftConfig = null;
  scrape.discordServerId = null;
  scrape.chatPrompt = null;
}

export function sanitizeThread(thread?: Thread | null) {
  if (thread?.emailOtp) {
    thread.emailOtp = "xxxxxx";
  }
}
