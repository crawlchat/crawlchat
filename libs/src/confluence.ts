import { ConfluenceClient } from "confluence.js";
import { Content, ContentArray } from "confluence.js/dist/esm/types/api/models";

export * from "confluence.js";

export type ConfluenceConfig = {
  apiKey: string;
  email: string;
  host: string;
};

export type ConfluencePage = {
  id: string;
  title: string;
  url: string;
};

function getCursor(next?: string | null) {
  if (!next) return undefined;
  const nextUrl = new URL("https://test.com" + next);
  return nextUrl.searchParams.get("cursor") || undefined;
}

export async function getConfluencePages(
  config: ConfluenceConfig,
  options?: {
    max?: number;
  }
): Promise<ConfluencePage[]> {
  const client = new ConfluenceClient({
    host: config.host,
    authentication: {
      basic: {
        email: config.email,
        apiToken: config.apiKey,
      },
    },
  });

  const confluencePages: ConfluencePage[] = [];
  let cursor: string | undefined = undefined;

  do {
    try {
      const pages: ContentArray<Content> =
        await client.content.searchContentByCQL({
          cql: "type = 'page'",
          cursor: cursor,
        });

      console.log(`Retrieved ${pages.results.length} pages`);

      confluencePages.push(
        ...pages.results.map((page) => ({
          id: page.id,
          title: page.title,
          url: `${config.host}/wiki${page._links?.tinyui}`,
        }))
      );

      if (options?.max && confluencePages.length >= options.max) {
        break;
      }

      cursor = getCursor(pages._links?.next);
    } catch (e) {
      console.error("Confluence search error:", e);
      break;
    }
  } while (cursor);

  return confluencePages;
}
