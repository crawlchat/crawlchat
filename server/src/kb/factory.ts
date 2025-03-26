import { KnowledgeGroup, Scrape } from "libs/prisma";
import { WebKbProcesser } from "./web-kb-processer";
import { KbProcesser, KbProcesserListener } from "./kb-processer";

export function makeKbProcesser(
  listener: KbProcesserListener,
  scrape: Scrape,
  knowledgeGroup: KnowledgeGroup,
  options: { hasCredits: () => Promise<boolean>; limit?: number }
): KbProcesser {
  if (knowledgeGroup.type === "scrape_web") {
    const url = knowledgeGroup.url;
    if (!url) {
      throw new Error("URL is required");
    }

    const processer = new WebKbProcesser(listener, scrape, url, {
      hasCredits: options.hasCredits,
      removeHtmlTags: knowledgeGroup.removeHtmlTags ?? undefined,
      dynamicFallbackContentLength:
        knowledgeGroup.staticContentThresholdLength ?? undefined,
      limit: options.limit,
      allowOnlyRegex:
        knowledgeGroup.matchPrefix && knowledgeGroup.url
          ? new RegExp(`^${knowledgeGroup.url.replace(/\/$/, "")}.*`)
          : undefined,
    });

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

    const processer = new WebKbProcesser(listener, scrape, url, {
      hasCredits: options.hasCredits,
      removeHtmlTags,
      dynamicFallbackContentLength:
        knowledgeGroup.staticContentThresholdLength ?? undefined,
      limit: options.limit,
      allowOnlyRegex: new RegExp(allowOnlyRegex),
    });

    return processer;
  }

  throw new Error("Unsupported knowledge group type");
}
