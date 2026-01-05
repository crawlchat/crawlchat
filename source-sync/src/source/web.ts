import { GroupData, ItemWebData } from "src/source/queue";
import { scrapeWithLinks } from "../scrape/crawl";
import { getMetaTitle } from "../scrape/parse";
import {
  GroupForSource,
  Source,
  GroupStartReponse,
  ItemForSource,
  ScrapeItemResponse,
} from "./interface";
import { prisma } from "libs/dist/prisma";

export class WebSource implements Source {
  cleanUrl(url: string) {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    return url;
  }

  async updateGroup(
    group: GroupForSource,
    jobData: GroupData
  ): Promise<GroupStartReponse> {
    if (!group.url) {
      throw new Error("Group url is required");
    }

    const item = await prisma.scrapeItem.upsert({
      where: {
        knowledgeGroupId_url: {
          knowledgeGroupId: group.id,
          url: group.url,
        },
      },
      update: {
        status: "pending",
      },
      create: {
        knowledgeGroupId: group.id,
        scrapeId: group.scrape.id,
        url: group.url,
        status: "pending",
        title: "Untitled",
        userId: group.scrape.userId,
        markdown: "Not yet available",
      },
    });

    return {
      itemIds: [item.id],
    };
  }

  async updateItem(
    item: ItemForSource,
    jobData: ItemWebData
  ): Promise<ScrapeItemResponse> {
    if (!item.url || !item.knowledgeGroup?.url) {
      throw new Error("Item url is required");
    }

    const { markdown, links, metaTags } = await scrapeWithLinks(
      item.url,
      item.knowledgeGroup.url,
      {
        removeHtmlTags: item.knowledgeGroup.removeHtmlTags ?? undefined,
        dynamicFallbackContentLength:
          item.knowledgeGroup.staticContentThresholdLength ?? undefined,
        allowOnlyRegex:
          item.knowledgeGroup.matchPrefix && item.knowledgeGroup.url
            ? new RegExp(`^${item.knowledgeGroup.url.replace(/\/$/, "")}.*`)
            : undefined,
        skipRegex: item.knowledgeGroup.skipPageRegex
          ? item.knowledgeGroup.skipPageRegex
              .split(",")
              .map((r) => new RegExp(r))
          : undefined,
      }
    );

    const itemIds = [];

    if (!jobData.justThis) {
      for (const linkUrl of links) {
        const url = this.cleanUrl(linkUrl);

        const existingItem = await prisma.scrapeItem.findUnique({
          where: {
            knowledgeGroupId_url: {
              knowledgeGroupId: item.knowledgeGroupId,
              url,
            },
          },
        });

        if (existingItem?.updatedByProcessId === jobData.processId) {
          continue;
        }

        const newItem = await prisma.scrapeItem.upsert({
          where: {
            knowledgeGroupId_url: {
              knowledgeGroupId: item.knowledgeGroupId,
              url,
            },
          },
          update: {
            status: "pending",
            updatedByProcessId: jobData.processId,
          },
          create: {
            knowledgeGroupId: item.knowledgeGroupId,
            scrapeId: item.scrapeId,
            url,
            status: "pending",
            title: "Pending",
            userId: item.userId,
            markdown: "Not yet available",
            updatedByProcessId: jobData.processId,
          },
        });

        itemIds.push(newItem.id);
      }
    }

    return {
      itemIds,
      page: {
        text: markdown,
        title: getMetaTitle(metaTags) ?? "Untitled",
      },
    };
  }
}
