import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { getLinearPages, LinearClient } from "libs/linear";

export class LinearKbProcesser extends BaseKbProcesser {
  private readonly client: LinearClient;

  constructor(
    protected listener: KbProcesserListener,
    private readonly knowledgeGroup: KnowledgeGroup,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
      url?: string;
    }
  ) {
    super(listener, options);

    if (!this.knowledgeGroup.linearApiKey) {
      throw new Error("Linear API key is required");
    }

    this.client = new LinearClient({
      apiKey: this.knowledgeGroup.linearApiKey!,
    });
  }

  async process() {
    let pages = await getLinearPages(this.client);

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
      const parts: string[] = [];

      const linearPage = await this.client.issue(page.id);
      parts.push(`# ${linearPage.title}\n\n${linearPage.description}`);

      const comments = await linearPage.comments();
      do {
        await comments.fetchNext();
      } while (comments.pageInfo.hasNextPage);

      const commentContents = await Promise.all(
        comments.nodes.map(async (comment) => {
          return { body: comment.body, author: (await comment.user)?.name };
        })
      );

      if (commentContents.length > 0) {
        parts.push(
          `### Comments\n${commentContents
            .map((comment) => `${comment.author}: ${comment.body}`)
            .join("\n\n")}`
        );
      }

      const text = parts.join("\n\n");

      this.onContentAvailable(
        page.url,
        {
          text,
          title: page.title || "Untitled",
        },
        {
          remaining: pages.length - i,
          completed: i,
        }
      );
    }
  }
}
