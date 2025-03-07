import type { Scrape } from "@prisma/client";

export function getScrapeTitle(scrape: Scrape) {
  return scrape.title ?? scrape.url;
}
