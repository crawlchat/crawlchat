import { Agent, Flow, multiLinePrompt } from "@packages/agentic";
import { getToken } from "./token";
import fetch from "node-fetch";
import { makeSearchTool, SearchToolContext } from "../llm/search-tool";
import { getConfig } from "../llm/config";
import z from "zod";
import {
  makeTextSearchRegexTool,
  TextSearchToolContext,
} from "../llm/text-search-tool";
import { consumeCredits } from "@packages/common/user-plan";

type GitHubPostResponse = {
  id: number;
  html_url: string;
};

type DiffChange = {
  type: "add" | "del" | "normal";
  content: string;
  ln?: number;
  ln1?: number;
  ln2?: number;
};

type DiffChunk = {
  changes: DiffChange[];
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

type ParsedDiffFile = {
  chunks: DiffChunk[];
  deletions: number;
  additions: number;
  from?: string;
  to?: string;
};

export function parseSimpleDiff(diffText: string): ParsedDiffFile[] {
  const files: ParsedDiffFile[] = [];
  const lines = diffText.split("\n");
  let currentFile: ParsedDiffFile | null = null;
  let currentChunk: DiffChunk | null = null;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (currentFile) {
        files.push(currentFile);
      }
      currentFile = {
        chunks: [],
        deletions: 0,
        additions: 0,
        from: undefined,
        to: undefined,
      };
      currentChunk = null;
    } else if (line.startsWith("--- a/")) {
      if (currentFile) currentFile.from = line.slice(6);
    } else if (line.startsWith("+++ b/")) {
      if (currentFile) currentFile.to = line.slice(6);
    } else if (line.startsWith("@@")) {
      if (currentFile && currentChunk) {
        currentFile.chunks.push(currentChunk);
      }
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (match) {
        currentChunk = {
          oldStart: parseInt(match[1]),
          oldLines: parseInt(match[2] || "1"),
          newStart: parseInt(match[3]),
          newLines: parseInt(match[4] || "1"),
          changes: [],
        };
      }
    } else if (currentChunk && currentFile) {
      if (line.startsWith("+")) {
        currentChunk.changes.push({ type: "add", content: line.slice(1) });
        currentFile.additions++;
      } else if (line.startsWith("-")) {
        currentChunk.changes.push({ type: "del", content: line.slice(1) });
        currentFile.deletions++;
      } else if (line.startsWith(" ")) {
        currentChunk.changes.push({ type: "normal", content: line.slice(1) });
      }
    }
  }

  if (currentFile) {
    if (currentChunk) currentFile.chunks.push(currentChunk);
    files.push(currentFile);
  }

  return files;
}

export function analyzeDiffDefault(files: ParsedDiffFile[]): string {
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  let analysis = `## 📊 PR Diff Analysis\n\n`;
  analysis += `**${files.length} files changed** | **+${totalAdditions} lines added** | **-${totalDeletions} lines deleted**\n\n`;

  for (const file of files.slice(0, 5)) {
    const fileName = file.to || file.from || "unknown";
    analysis += `### ${fileName}\n`;
    analysis += `+${file.additions} / -${file.deletions}\n\n`;

    for (const chunk of file.chunks.slice(0, 2)) {
      const addedLines = chunk.changes
        .filter((c) => c.type === "add")
        .map((c) => c.content);
      const deletedLines = chunk.changes
        .filter((c) => c.type === "del")
        .map((c) => c.content);

      if (addedLines.length > 0) {
        analysis += "**Added:**\n```\n";
        analysis += addedLines.slice(0, 5).join("\n");
        if (addedLines.length > 5) analysis += "\n...";
        analysis += "\n```\n\n";
      }

      if (deletedLines.length > 0) {
        analysis += "**Removed:**\n```\n";
        analysis += deletedLines.slice(0, 5).join("\n");
        if (deletedLines.length > 5) analysis += "\n...";
        analysis += "\n```\n\n";
      }
    }

    if (file.chunks.length > 2) {
      analysis += `*... and ${file.chunks.length - 2} more chunks*\n\n`;
    }
  }

  if (files.length > 5) {
    analysis += `*... and ${files.length - 5} more files*\n`;
  }

  return analysis;
}

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.diff",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PR diff: ${error}`);
  }

  return response.text();
}

export async function postPullRequestComment(
  token: string,
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
): Promise<GitHubPostResponse> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post PR comment: ${error}`);
  }

  return (await response.json()) as GitHubPostResponse;
}

export async function analyzeDiff(
  scrapeId: string,
  userId: string,
  diffText: string
) {
  const llmConfig = getConfig("openrouter/openai/gpt-5.1");

  const context: TextSearchToolContext & SearchToolContext = {
    queries: [],
    textSearchToolCalls: 0,
  };

  const agent = new Agent({
    id: "pr-analyzer",
    prompt: multiLinePrompt([
      "You are a helpful assistant that analyzes the diff of a PR and provides a summary of the changes.",
      "For each change, find out if there is any conflicting information in the knowledge base.",
      "Use the text_search_regex and search_data tool to find out if there is any conflicting information in the knowledge base.",
      "Use text_search_regex more so that you can find all the conflicting information in the knowledge base.",
      "The diff is given below:",

      diffText,
    ]),
    schema: z.object({
      conflicts: z
        .array(
          z.object({
            url: z
              .string()
              .describe("The conflict item URL from the knowledge base."),
            reason: z
              .string()
              .describe(
                "The reason for the conflict. It should be under 30 words."
              ),
          })
        )
        .describe("List of conflicts with the knowledge base."),
    }),
    tools: [
      makeSearchTool(scrapeId, "mars", {
        topN: 4,
        minScore: 0,
        queryContext: context,
      }),
      makeTextSearchRegexTool(scrapeId, context),
    ],
    ...llmConfig,
  });

  const flow = new Flow([agent], {
    messages: [
      {
        llmMessage: {
          role: "user",
          content: diffText,
        },
      },
    ],
  });

  flow.addNextAgents(["pr-analyzer"]);

  while (await flow.stream()) {}

  const response = JSON.parse(
    flow.getLastMessage().llmMessage.content as string
  );

  const lines = ["### Conflicts", "\n"];
  for (const conflict of response.conflicts) {
    lines.push(`- [${conflict.url}](${conflict.url}): ${conflict.reason}`);
  }
  lines.push("");

  await consumeCredits(userId, "messages", 6);

  return lines.join("\n");
}

export async function analyze(
  scrapeId: string,
  userId: string,
  installationId: number,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<void> {
  console.log(`Analyzing PR #${pullNumber} diff for ${owner}/${repo}`);

  const token = await getToken(installationId);
  const diffText = await getPullRequestDiff(token, owner, repo, pullNumber);

  if (!diffText.trim()) {
    console.log(`No diff found for PR #${pullNumber}`);
    return;
  }

  const analysis = await analyzeDiff(scrapeId, userId, diffText);

  await postPullRequestComment(token, owner, repo, pullNumber, analysis);
  console.log(`Posted diff analysis on PR #${pullNumber}`);
}
