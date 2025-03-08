import { ScrapeItem } from "libs/prisma";

export function makeLLMTxt(scrapeItems: ScrapeItem[]) {
  const scrapeTxts = scrapeItems.map((scrapeItem) => {
    return `Url: ${scrapeItem.url}
Title: ${scrapeItem.title}
Content: 
${scrapeItem.markdown}
`;
  });
  return scrapeTxts.join("\n---\n");
}
