import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import {
  getIssueMarkdown,
  getIssueTimeline,
  getJustIssues,
} from "../github-api";
import { githubApiRateLimiter } from "../rate-limiter";

export class GithubIssuesKbProcesser extends BaseKbProcesser {
  constructor(
    protected listener: KbProcesserListener,
    private readonly knowledgeGroup: KnowledgeGroup,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
    }
  ) {
    super(listener, options);
  }

  async process() {
    if (!this.knowledgeGroup.url) {
      throw new Error("Knowledge group URL is required");
    }

    const match = this.knowledgeGroup.url.match(
      "https://(www.)?github.com/(.+)/(.+)"
    );
    if (!match) {
      throw new Error("Invalid GitHub URL");
    }

    const [, , username, repo] = match;

    const issues = await getJustIssues({
      repo,
      username,
      n: 100,
    });

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      if (issue.pull_request) {
        continue;
      }

      const timeline = await getIssueTimeline({
        repo,
        username,
        issueNumber: issue.number,
      });

      await this.onContentAvailable(
        issue.html_url,
        { text: getIssueMarkdown(issue, timeline), title: issue.title },
        { remaining: issues.length - i, completed: i }
      );

      await githubApiRateLimiter.wait();
    }
  }
}
