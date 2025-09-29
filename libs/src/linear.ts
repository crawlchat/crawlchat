import { LinearClient } from "@linear/sdk";

export { LinearClient };

export type LinearPage = {
  id: string;
  title: string;
  url: string;
};

export async function getLinearPages(
  client: LinearClient
): Promise<LinearPage[]> {
  const issues = await client.issues();

  do {
    await issues.fetchNext();
  } while (issues.pageInfo.hasNextPage);

  return issues.nodes.map((issue) => ({
    id: issue.id,
    title: issue.title,
    url: issue.url,
  }));
}
