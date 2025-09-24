import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { getConfluencePages } from "libs/confluence";
import { getConfluencePageContent } from "../confluence";

export class ConfluenceKbProcesser extends BaseKbProcesser {
  constructor(
    protected listener: KbProcesserListener,
    private readonly knowledgeGroup: KnowledgeGroup,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
      url?: string;
    }
  ) {
    super(listener, options);

    if (!this.knowledgeGroup.confluenceApiKey) {
      throw new Error("Confluence API key is required");
    }
    if (!this.knowledgeGroup.confluenceEmail) {
      throw new Error("Confluence email is required");
    }
    if (!this.knowledgeGroup.confluenceHost) {
      throw new Error("Confluence host is required");
    }
  }

  async process() {
    let pages = await getConfluencePages({
      apiKey: this.knowledgeGroup.confluenceApiKey!,
      email: this.knowledgeGroup.confluenceEmail!,
      host: this.knowledgeGroup.confluenceHost!,
    });

    const skipRegexes = (
      this.knowledgeGroup.skipPageRegex?.split(",") ?? []
    ).filter(Boolean);
    const filteredPages = pages.filter((page) => {
      return !skipRegexes.some((regex) => {
        const r = new RegExp(regex.trim());
        return r.test(page.id);
      });
    });

    for (let i = 0; i < filteredPages.length; i++) {
      const page = filteredPages[i];
      const pageContent = await getConfluencePageContent(
        {
          apiKey: this.knowledgeGroup.confluenceApiKey!,
          email: this.knowledgeGroup.confluenceEmail!,
          host: this.knowledgeGroup.confluenceHost!,
        },
        page.id
      );
      const title = page.title;
      const url = page.url;

      const text = pageContent.markdown;

      this.onContentAvailable(
        url,
        {
          text,
          title: title || "Untitled",
        },
        {
          remaining: pages.length - i,
          completed: i,
        }
      );
    }
  }
}
