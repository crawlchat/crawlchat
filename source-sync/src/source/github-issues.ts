import {
  getIssue,
  getIssueMarkdown,
  getIssues,
  getIssueTimeline,
} from "src/github-api";
import {
  GroupForSource,
  UpdateGroupReponse,
  UpdateItemResponse,
  Source,
} from "./interface";
import { GroupData, ItemData } from "./queue";
import { scheduleUrl } from "./schedule-url";

const ISSUES_TO_FETCH: Record<string, number> = {
  "692bb91325e4f55feefdfe82": 10000,
};

export class GithubIssuesSource implements Source {
  getDelay(): number {
    return 0;
  }

  async updateGroup(
    jobData: GroupData,
    group: GroupForSource,
  ): Promise<UpdateGroupReponse> {
    const match = group.url!.match("https://(www.)?github.com/(.+)/(.+)");
    if (!match) {
      throw new Error("Invalid GitHub URL");
    }

    const [, , username, repo] = match;

    const { issues, pagination } = await getIssues({
      repo,
      username,
      state: "open",
      pageUrl: jobData.githubIssuesPagination,
    });

    for (const issue of issues) {
      await scheduleUrl(
        group,
        jobData.processId,
        issue.html_url  
      );
    }

    return {
      groupJobs: pagination.nextUrl
        ? [{ ...jobData, githubIssuesPagination: pagination.nextUrl }]
        : undefined,
    };
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource,
  ): Promise<UpdateItemResponse> {
    const match = group.url!.match(
      "https://(www.)?github.com/(.+)/(.+)"
    );
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

    return {
      page: {
        title: issue.title ?? "Untitled",
        text: getIssueMarkdown(issue, timeline),
      },
    };
  }
}
