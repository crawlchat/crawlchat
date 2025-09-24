import { parseHtml } from "./scrape/parse";
import { ConfluenceConfig, ConfluenceClient } from "libs/confluence";

export type ConfluencePageContent = {
  markdown: string;
};

export async function getConfluencePageContent(
  config: ConfluenceConfig,
  pageId: string
): Promise<ConfluencePageContent> {
  const client = new ConfluenceClient({
    host: config.host,
    authentication: {
      basic: {
        email: config.email,
        apiToken: config.apiKey,
      },
    },
  });

  const pageContent = await client.content.getContentById({
    id: pageId,
    expand: ["body.storage", "body.view", "version", "space"],
  });

  if (!pageContent.body?.view?.value) {
    throw new Error("Page content not found");
  }

  return {
    markdown: parseHtml(pageContent.body.view.value).markdown,
  };
}
