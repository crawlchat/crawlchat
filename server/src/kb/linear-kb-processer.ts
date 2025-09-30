import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { getLinearIssues, LinearClient } from "libs/linear";

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
    let issues = await getLinearIssues(this.client);

    const skipRegexes = (
      this.knowledgeGroup.skipPageRegex?.split(",") ?? []
    ).filter(Boolean);

    let filteredIssues = issues.filter((issue) => {
      return !skipRegexes.some((regex) => {
        const r = new RegExp(regex.trim());
        return r.test(issue.id);
      });
    });

    if (this.knowledgeGroup.linearSkipIssueStatuses) {
      const skipIssueStatuses = this.knowledgeGroup.linearSkipIssueStatuses
        .split(",")
        .filter(Boolean);
      filteredIssues = filteredIssues
        .filter((issue) => issue.stateId)
        .filter((issue) => {
          return !skipIssueStatuses.includes(issue.stateId!);
        });
    }

    const projects = await this.client.projects();
    do {
      await projects.fetchNext();
    } while (projects.pageInfo.hasNextPage);

    let filteredProjects = projects.nodes;
    if (this.knowledgeGroup.linearSkipProjectStatuses) {
      const skipProjectStatuses = this.knowledgeGroup.linearSkipProjectStatuses
        .split(",")
        .filter(Boolean);

      filteredProjects = filteredProjects.filter((project) => {
        return !skipProjectStatuses.includes(project.statusId!);
      });
    }

    const totalPages = filteredIssues.length + filteredProjects.length;

    for (let i = 0; i < filteredIssues.length; i++) {
      const issue = filteredIssues[i];
      const parts: string[] = [];

      const linearPage = await this.client.issue(issue.id);
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

      const status = await issue.state;
      if (status?.name) {
        parts.push(`Status: ${status.name}`);
      }

      const text = parts.join("\n\n");

      this.onContentAvailable(
        issue.url,
        {
          text,
          title: issue.title || "Untitled",
        },
        {
          remaining: totalPages - i,
          completed: i,
        }
      );
    }

    for (let i = 0; i < filteredProjects.length; i++) {
      const project = filteredProjects[i];
      const updates = await project.projectUpdates();
      do {
        await updates.fetchNext();
      } while (updates.pageInfo.hasNextPage);

      const parts: string[] = [];
      parts.push(`# ${project.name}\n\n${project.description}`);
      if (project.content) {
        parts.push(project.content);
      }

      const status = await project.status;
      if (status?.name) {
        parts.push(`Status: ${status.name}`);
      }

      if (updates.nodes.length > 0) {
        parts.push(
          `### Updates\n${updates.nodes
            .map((update) => update.body)
            .join("\n\n")}`
        );
      }

      const text = parts.join("\n\n");

      this.onContentAvailable(
        project.url,
        {
          text,
          title: project.name || "Untitled",
        },
        {
          remaining: totalPages - (i + filteredIssues.length),
          completed: i + filteredIssues.length,
        }
      );
    }
  }
}
