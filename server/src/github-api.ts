type GithubIssue = {
  url: string;
  id: number;
  number: number;
  labels: string[];
  state: "open" | "closed" | "all";
  body: string;
  user: GithubUser;
  pull_request: {
    url: string;
  };
};

type GithubTimelineEvent = {
  body?: string;
  event: string;
  created_at: string;
  actor: GithubUser;
};

type GithubUser = {
  login: string;
  id: string;
};

export async function getIssues({
  repo,
  username,
  perPage = 100,
  page = 1,
  state = "closed",
}: {
  repo: string;
  username: string;
  perPage?: number;
  page?: number;
  state?: "open" | "closed" | "all";
}): Promise<GithubIssue[]> {
  console.log(`Fetching issues for ${username}/${repo}...`);
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}/issues?per_page=${perPage}&page=${page}&state=${state}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return await response.json();
}

export async function getIssue({
  repo,
  username,
  issueNumber,
}: {
  repo: string;
  username: string;
  issueNumber: number;
}): Promise<GithubIssue> {
  console.log(`Fetching issue ${issueNumber} for ${username}/${repo}...`);
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}/issues/${issueNumber}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return await response.json();
}

export async function getIssueTimeline({
  repo,
  username,
  issueNumber,
}: {
  repo: string;
  username: string;
  issueNumber: number;
}): Promise<GithubTimelineEvent[]> {
  console.log(
    `Fetching timeline for issue ${issueNumber} for ${username}/${repo}...`
  );
  const response = await fetch(
    `https://api.github.com/repos/${username}/${repo}/issues/${issueNumber}/timeline?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return await response.json();
}

export function getIssueMarkdown(
  issue: GithubIssue,
  timeline: GithubTimelineEvent[]
) {
  const entries: string[] = [issue.body];
  for (const event of timeline) {
    if (event.event === "commented" && event.body) {
      entries.push(event.body);
    }
  }
  return entries.join("\n\n");
}
