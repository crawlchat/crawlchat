import type { Scrape } from "libs/prisma";

export function getScrapeTitle(scrape: Scrape) {
  return scrape.title ?? scrape.url;
}
