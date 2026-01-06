import {
  getIssue,
  getIssueMarkdown,
  getIssues,
  getIssueTimeline,
} from "src/github-api";
import { GroupForSource, UpdateItemResponse, Source } from "./interface";
import { GroupData, ItemData } from "./queue";
import { scheduleGroup, scheduleUrl } from "./schedule";

export class GithubIssuesSource implements Source {
  getDelay(): number {
    return 0;
  }

  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    const match = group.url!.match("https://(www.)?github.com/(.+)/(.+)");
    if (!match) {
      throw new Error("Invalid GitHub URL");
    }

    const [, , username, repo] = match;
    const allowedStates = group.allowedGithubIssueStates
      ?.split(",")
      .filter(Boolean) ?? ["closed"];
    const stateToFetch =
      allowedStates.length === 1
        ? (allowedStates[0] as "open" | "closed" | "all")
        : "all";

    const { issues, pagination } = await getIssues({
      repo,
      username,
      state: stateToFetch,
      pageUrl: jobData.githubIssuesPagination,
    });

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];

      if (!allowedStates.includes(issue.state)) {
        continue;
      }

      await scheduleUrl(
        group,
        jobData.processId,
        issue.html_url,
        i === issues.length - 1
          ? { githubIssuesPagination: pagination.nextUrl }
          : undefined
      );
    }
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource
  ): Promise<UpdateItemResponse> {
    const match = group.url!.match("https://(www.)?github.com/(.+)/(.+)");
    if (!match) {
      throw new Error("Invalid GitHub URL");
    }
    const [, , username, repo] = match;
    const issueNumber = parseInt(jobData.url.split("/").pop()!);

    const issue = await getIssue({
      repo,
      username,
      issueNumber,
    });

    const timeline = await getIssueTimeline({
      repo,
      username,
      issueNumber,
    });

    if (jobData.githubIssuesPagination) {
      await scheduleGroup(group, jobData.processId, {
        githubIssuesPagination: jobData.githubIssuesPagination,
      });
    }

    return {
      page: {
        title: issue.title ?? "Untitled",
        text: getIssueMarkdown(issue, timeline),
      },
    };
  }
}
