import { GroupForSource, UpdateItemResponse, Source } from "./interface";
import { GroupData, ItemData } from "./queue";
import { ConfluenceClient } from "libs/confluence";
import { scheduleGroup, scheduleUrl } from "./schedule";
import { parseHtml } from "src/scrape/parse";

function getCursor(next?: string | null) {
  if (!next) return undefined;
  const nextUrl = new URL("https://test.com" + next);
  return nextUrl.searchParams.get("cursor") || undefined;
}

export class ConfluenceSource implements Source {
  private getClient(group: GroupForSource) {
    return new ConfluenceClient({
      host: group.confluenceHost!,
      authentication: {
        basic: {
          email: group.confluenceEmail!,
          apiToken: group.confluenceApiKey!,
        },
      },
    });
  }

  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    const client = this.getClient(group);
    const rawPages = await client.content.searchContentByCQL({
      cql: "type = 'page'",
      cursor: jobData.cursor,
    });
    const pages = rawPages.results.map((page) => ({
      id: page.id,
      title: page.title,
      url: `${group.confluenceHost!}/wiki${page._links?.tinyui}`,
    }));

    const skipRegexes = (group.skipPageRegex?.split(",") ?? []).filter(Boolean);
    const filteredPages = pages.filter((page) => {
      return !skipRegexes.some((regex) => {
        const r = new RegExp(regex.trim());
        return r.test(page.id);
      });
    });

    for (let i = 0; i < filteredPages.length; i++) {
      const page = filteredPages[i];
      await scheduleUrl(group, jobData.processId, page.url, {
        sourePageId: page.id,
        cursor:
          i === filteredPages.length - 1
            ? getCursor(rawPages._links?.next)
            : undefined,
      });
    }
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource
  ): Promise<UpdateItemResponse> {
    if (!jobData.sourePageId) {
      throw new Error("Source page ID is required");
    }

    const client = this.getClient(group);
    const pageId = jobData.sourePageId;

    const pageContent = await client.content.getContentById({
      id: pageId,
      expand: ["body.storage", "body.view", "version", "space"],
    });

    const page = await client.content.searchContentByCQL({
      cql: `id = ${pageId}`,
    });

    if (!pageContent.body?.view?.value) {
      throw new Error("Page content not found");
    }

    if (jobData.cursor) {
      await scheduleGroup(group, jobData.processId, {
        cursor: jobData.cursor,
      });
    }

    return {
      page: {
        text: parseHtml(pageContent.body.view.value).markdown,
        title: page.results[0].title,
      },
    };
  }
}
