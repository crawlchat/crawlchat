import type { Scrape } from "libs/prisma";
import { redirect } from "react-router";
import { getSession } from "~/session";

export function getScrapeTitle(scrape: Scrape) {
  return scrape.title ?? scrape.url ?? "Untitled";
}

export async function getSessionScrapeId(request: Request) {
  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");

  if (!scrapeId) {
    throw redirect("/app");
  }

  return scrapeId;
}
