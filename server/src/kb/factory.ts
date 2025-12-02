import { KnowledgeGroup, Scrape } from "libs/prisma";
import { WebKbProcesser } from "./web-kb-processer";
import { KbProcesser, KbProcesserListener } from "./kb-processer";
import { GithubIssuesKbProcesser } from "./gh-issues-kb-processer";
import { NotionKbProcesser } from "./notion-kb-processer";
import { ConfluenceKbProcesser } from "./confluence-kb-processer";
import { LinearKbProcesser } from "./linear-kb-processer";
import { YoutubeKbProcesser } from "./youtube-kb-processer";

export function makeKbProcesser(
  listener: KbProcesserListener,
  scrape: Scrape,
  knowledgeGroup: KnowledgeGroup,
  options: {
    limit?: number;
    url?: string;
  }
): KbProcesser {
  if (knowledgeGroup.type === "scrape_web") {
    const url = options.url ?? knowledgeGroup.url;
    if (!url) {
      throw new Error("URL is required");
    }

    const processer = new WebKbProcesser(
      listener,
      scrape,
      knowledgeGroup,
      url,
      {
        removeHtmlTags: knowledgeGroup.removeHtmlTags ?? undefined,
        dynamicFallbackContentLength:
          knowledgeGroup.staticContentThresholdLength ?? undefined,
        limit: options.limit,
        allowOnlyRegex:
          knowledgeGroup.matchPrefix && knowledgeGroup.url
            ? new RegExp(`^${knowledgeGroup.url.replace(/\/$/, "")}.*`)
            : undefined,
        skipRegex: knowledgeGroup.skipPageRegex
          ? knowledgeGroup.skipPageRegex.split(",").map((r) => new RegExp(r))
          : undefined,
        scrollSelector: knowledgeGroup.scrollSelector ?? undefined,
        maxWait: knowledgeGroup.maxWait || undefined,
      }
    );

    return processer;
  }

  if (knowledgeGroup.type === "github_issues") {
    return new GithubIssuesKbProcesser(listener, knowledgeGroup);
  }

  if (knowledgeGroup.type === "notion") {
    return new NotionKbProcesser(listener, knowledgeGroup, options);
  }

  if (knowledgeGroup.type === "confluence") {
    return new ConfluenceKbProcesser(listener, knowledgeGroup, options);
  }

  if (knowledgeGroup.type === "linear") {
    return new LinearKbProcesser(listener, knowledgeGroup, options);
  }

  if (knowledgeGroup.type === "youtube") {
    return new YoutubeKbProcesser(listener, knowledgeGroup);
  }

  throw new Error("Unsupported knowledge group type");
}
