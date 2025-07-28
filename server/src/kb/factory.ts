import { KnowledgeGroup, Scrape } from "libs/prisma";
import { WebKbProcesser } from "./web-kb-processer";
import { KbProcesser, KbProcesserListener } from "./kb-processer";
import { GithubIssuesKbProcesser } from "./gh-issues-kb-processer";

export function makeKbProcesser(
  listener: KbProcesserListener,
  scrape: Scrape,
  knowledgeGroup: KnowledgeGroup,
  options: { hasCredits: () => Promise<boolean>; limit?: number; url?: string }
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
        hasCredits: options.hasCredits,
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
      }
    );

    return processer;
  }

  if (knowledgeGroup.type === "scrape_github") {
    if (!knowledgeGroup.githubUrl) {
      throw new Error("GitHub URL is required");
    }

    if (!knowledgeGroup.githubBranch) {
      throw new Error("GitHub Branch is required");
    }

    const url = `${knowledgeGroup.githubUrl}/tree/${knowledgeGroup.githubBranch}`;
    const allowOnlyRegex = "https://github.com/[^/]+/[^/]+/(tree|blob)/main.*";
    const removeSelectors = [".react-line-number", "#repos-file-tree"];
    const removeHtmlTags = removeSelectors.join(",");

    const processer = new WebKbProcesser(
      listener,
      scrape,
      knowledgeGroup,
      url,
      {
        hasCredits: options.hasCredits,
        removeHtmlTags,
        dynamicFallbackContentLength:
          knowledgeGroup.staticContentThresholdLength ?? undefined,
        limit: options.limit,
        allowOnlyRegex: new RegExp(allowOnlyRegex),
      }
    );

    return processer;
  }

  if (knowledgeGroup.type === "github_issues") {
    return new GithubIssuesKbProcesser(listener, knowledgeGroup, options);
  }

  throw new Error("Unsupported knowledge group type");
}
