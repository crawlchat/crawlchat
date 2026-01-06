import { GroupForSource, UpdateItemResponse, Source } from "./interface";
import { GroupData, ItemData } from "./queue";
import { LinearClient, PaginationOrderBy } from "libs/linear";
import { scheduleGroup, scheduleUrl } from "./schedule";

export class LinearIssuesSource implements Source {
  private getClient(group: GroupForSource) {
    return new LinearClient({
      apiKey: group.linearApiKey!,
    });
  }

  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    const client = this.getClient(group);

    const issues = await client.issues({
      filter: {
        state: {
          id: {
            nin: group.linearSkipIssueStatuses?.split(",") ?? [],
          },
        },
      },
      orderBy: PaginationOrderBy.UpdatedAt,
      first: 10,
      after: jobData.cursor,
    });

    for (let i = 0; i < issues.nodes.length; i++) {
      const issue = issues.nodes[i];
      await scheduleUrl(group, jobData.processId, issue.url, {
        cursor:
          i === issues.nodes.length - 1 ? issues.pageInfo.endCursor : undefined,
        sourePageId: issue.id,
      });
    }
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource
  ): Promise<UpdateItemResponse> {
    const issueId = jobData.sourePageId;
    const client = this.getClient(group);
    const result = await client.issues({
      filter: {
        id: {
          eq: issueId,
        },
      },
      first: 1,
    });
    if (result.nodes.length === 0) {
      throw new Error("Issue not found");
    }
    const issue = result.nodes[0];

    const parts: string[] = [];

    parts.push(`# ${issue.title}\n\n${issue.description}`);

    const comments = await issue.comments();
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

    if (jobData.cursor) {
      await scheduleGroup(group, jobData.processId, {
        cursor: jobData.cursor,
      });
    }

    return {
      page: {
        text,
        title: issue.title || "Untitled",
      },
    };
  }
}
