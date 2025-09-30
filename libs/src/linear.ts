import { LinearClient } from "@linear/sdk";

export { LinearClient };

export async function getLinearIssues(client: LinearClient) {
  const issues = await client.issues({
    filter: {
      state: {},
    },
  });

  do {
    await issues.fetchNext();
  } while (issues.pageInfo.hasNextPage);

  return issues.nodes;
}

export async function getLinearProjects(client: LinearClient) {
  const projects = await client.projects();
  return projects.nodes;
}

export async function getLinearIssueStatuses(client: LinearClient) {
  const states = await client.workflowStates();
  return states.nodes;
}

export async function getLinearProjectStatuses(client: LinearClient) {
  const states = await client.projectStatuses();
  return states.nodes;
}
