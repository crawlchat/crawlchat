import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { getIssueMarkdown, getIssues, getIssueTimeline } from "../github-api";
import { getLimiter } from "../rate-limiter";

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
    const issues = await getIssues({
      repo: "remotion",
      username: "remotion-dev",
    });

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      if (issue.pull_request) {
        continue;
      }

      this.assertCreditsAvailable();
      const timeline = await getIssueTimeline({
        repo: "remotion",
        username: "remotion-dev",
        issueNumber: issue.number,
      });

      await this.onContentAvailable(
        issue.number.toString(),
        { text: getIssueMarkdown(issue, timeline) },
        { remaining: issues.length - i, completed: i }
      );

      await getLimiter("github-api").wait();
    }
  }
}
