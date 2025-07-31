import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

export class NotionKbProcesser extends BaseKbProcesser {
  private client: Client;

  constructor(
    protected listener: KbProcesserListener,
    private readonly knowledgeGroup: KnowledgeGroup,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
    }
  ) {
    super(listener, options);

    if (!this.knowledgeGroup.notionSecret) {
      throw new Error("Notion key is required");
    }

    this.client = new Client({
      auth: this.knowledgeGroup.notionSecret as string,
    });
  }

  async process() {
    const n2m = new NotionToMarkdown({ notionClient: this.client });
    let pages = await this.client.search({
      query: "",
      sort: {
        direction: "descending",
        timestamp: "last_edited_time",
      },
    });

    const skipRegexes = (
      this.knowledgeGroup.skipPageRegex?.split(",") ?? []
    ).filter(Boolean);
    const filteredPages = pages.results.filter((page) => {
      return !skipRegexes.some((regex) => {
        const r = new RegExp(regex.trim());
        return r.test(page.id);
      });
    });

    for (let i = 0; i < filteredPages.length; i++) {
      const page = filteredPages[i];
      const title = (page as any).properties?.title?.title?.[0]?.plain_text;
      const url = (page as any).url;
      const mdblocks = await n2m.pageToMarkdown(page.id);
      const mdString = n2m.toMarkdownString(mdblocks);
      this.onContentAvailable(
        url,
        {
          text: mdString.parent,
          title: title || "Untitled",
        },
        {
          remaining: pages.results.length - i,
          completed: i,
        }
      );
    }
  }
}
