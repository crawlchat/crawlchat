import { GroupData, ItemData } from "src/source/queue";
import { scrapeWithLinks } from "../scrape/crawl";
import { getMetaTitle } from "../scrape/parse";
import { GroupForSource, Source, UpdateItemResponse } from "./interface";
import { scheduleUrl } from "./schedule";

export class WebSource implements Source {
  cleanUrl(url: string) {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    return url;
  }

  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    if (!group.url) {
      throw new Error("Group url is required");
    }
    await scheduleUrl(group, jobData.processId, group.url, group.url);
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource
  ): Promise<UpdateItemResponse> {
    if (!group.url) {
      throw new Error("Group url is required");
    }

    const { markdown, links, metaTags } = await scrapeWithLinks(
      jobData.url,
      group.url!,
      {
        removeHtmlTags: group.removeHtmlTags ?? undefined,
        dynamicFallbackContentLength:
          group.staticContentThresholdLength ?? undefined,
        allowOnlyRegex: group.matchPrefix
          ? new RegExp(`^${group.url.replace(/\/$/, "")}.*`)
          : undefined,
        skipRegex: group.skipPageRegex
          ? group.skipPageRegex.split(",").map((r) => new RegExp(r))
          : undefined,
      }
    );

    if (!jobData.justThis) {
      for (const linkUrl of links) {
        const url = this.cleanUrl(linkUrl);
        await scheduleUrl(group, jobData.processId, url, url);
      }
    }

    return {
      page: {
        text: markdown,
        title: getMetaTitle(metaTags) ?? "Untitled",
      },
    };
  }
}
