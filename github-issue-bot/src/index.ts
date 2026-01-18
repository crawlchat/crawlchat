import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { App } from "@octokit/app";
import { Webhooks, createNodeMiddleware } from "@octokit/webhooks";
import { prisma } from "libs/prisma";
import { createToken } from "libs/jwt";
import { query } from "./api";

const appId = Number(process.env.GITHUB_APP_ID);
const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n");
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET!;
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const githubApp = new App({ appId, privateKey });
const webhooks = new Webhooks({ secret: webhookSecret });

const defaultPrompt = `You are responding inside a GitHub issue or discussion.
Be concise and direct. Use Markdown when helpful.
If you are unsure, ask a short clarifying question.`;

type Sender = { login?: string; type?: string } | null | undefined;

function normalizeOwner(value: string) {
  return value.trim().toLowerCase();
}

function normalizeRepo(value: string) {
  return value.trim().toLowerCase();
}

function stripMention(text: string) {
  return text.replace(/@crawlchat/gi, "").trim();
}

function hasCrawlchatMention(text: string) {
  return /@crawlchat\b/i.test(text);
}

function isBotSender(sender: Sender) {
  const login = sender?.login ?? "";
  return sender?.type === "Bot" || login.endsWith("[bot]");
}

function isLikelyQuestion(text: string) {
  const cleaned = text.trim();
  if (!cleaned) return false;
  if (cleaned.includes("?")) return true;
  const firstLine =
    cleaned.split("\n").find((line) => line.trim().length > 0) ?? "";
  const lowered = firstLine.toLowerCase();
  const starters = [
    "how",
    "what",
    "why",
    "where",
    "when",
    "who",
    "which",
    "is",
    "are",
    "do",
    "does",
    "did",
    "can",
    "could",
    "should",
    "would",
    "will",
    "help",
    "anyone",
    "does anyone",
    "is there",
  ];
  return starters.some(
    (starter) => lowered === starter || lowered.startsWith(`${starter} `)
  );
}

function limitText(text: string, max = 3000) {
  return text.length > max ? text.slice(0, max) : text;
}

function getMaxScore(links: Array<{ score?: number | null }> | null | undefined) {
  if (!links || links.length === 0) return null;
  return Math.max(...links.map((link) => link.score ?? 0));
}

async function findScrape(owner: string, repo: string) {
  const repoKey = normalizeRepo(`${owner}/${repo}`);
  const ownerKey = normalizeOwner(owner);
  return prisma.scrape.findFirst({
    where: {
      OR: [{ githubRepo: repoKey }, { githubOrg: ownerKey }],
    },
  });
}

async function respondIfNeeded({
  owner,
  repo,
  installationId,
  sender,
  rawText,
  promptText,
  clientThreadId,
  postReply,
}: {
  owner: string;
  repo: string;
  installationId: number | undefined;
  sender: Sender;
  rawText: string;
  promptText: string;
  clientThreadId: string;
  postReply: (octokit: any, body: string) => Promise<void>;
}) {
  if (!installationId) return;
  if (isBotSender(sender)) return;

  const scrape = await findScrape(owner, repo);
  if (!scrape) return;

  const mentionTriggered = hasCrawlchatMention(rawText);
  const questionTriggered = isLikelyQuestion(rawText);
  if (!mentionTriggered && !questionTriggered) return;

  const cleaned = limitText(stripMention(promptText));
  if (!cleaned) return;

  const { answer, message, error } = await query(
    scrape.id,
    [{ role: "user", content: cleaned }],
    createToken(scrape.userId),
    {
      prompt: defaultPrompt,
      clientThreadId,
      fingerprint: sender?.login,
    }
  );

  if (error || !answer) return;

  if (!mentionTriggered) {
    const maxScore = getMaxScore(message?.links);
    const minScore = scrape.minScore ?? 0;
    if (maxScore === null || maxScore < minScore) return;
  }

  const octokit = await githubApp.getInstallationOctokit(installationId);
  await postReply(octokit, answer);
}

function buildIssuePrompt({
  title,
  body,
  comment,
}: {
  title: string;
  body: string;
  comment?: string;
}) {
  const issuePart = [title, body].filter(Boolean).join("\n\n");
  if (comment) {
    return `${issuePart}\n\nComment:\n${comment}`;
  }
  return issuePart;
}

function buildDiscussionPrompt({
  title,
  body,
  comment,
}: {
  title: string;
  body: string;
  comment?: string;
}) {
  const discussionPart = [title, body].filter(Boolean).join("\n\n");
  if (comment) {
    return `${discussionPart}\n\nComment:\n${comment}`;
  }
  return discussionPart;
}

webhooks.on("issues.opened", async ({ payload }) => {
  if ((payload.issue as any).pull_request) return;
  const rawText = [payload.issue.title, payload.issue.body ?? ""]
    .filter(Boolean)
    .join("\n\n");
  const promptText = buildIssuePrompt({
    title: payload.issue.title ?? "",
    body: payload.issue.body ?? "",
  });
  const clientThreadId = `github:issue:${payload.repository.owner.login}/${payload.repository.name}#${payload.issue.number}`;
  await respondIfNeeded({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    installationId: payload.installation?.id,
    sender: payload.sender,
    rawText,
    promptText,
    clientThreadId,
    postReply: (octokit, body) =>
      octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body,
        }
      ),
  });
});

webhooks.on("issue_comment.created", async ({ payload }) => {
  if ((payload.issue as any).pull_request) return;
  const rawText = payload.comment.body ?? "";
  const promptText = buildIssuePrompt({
    title: payload.issue.title ?? "",
    body: payload.issue.body ?? "",
    comment: payload.comment.body ?? "",
  });
  const clientThreadId = `github:issue:${payload.repository.owner.login}/${payload.repository.name}#${payload.issue.number}`;
  await respondIfNeeded({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    installationId: payload.installation?.id,
    sender: payload.sender,
    rawText,
    promptText,
    clientThreadId,
    postReply: (octokit, body) =>
      octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body,
        }
      ),
  });
});

webhooks.on("discussion.created", async ({ payload }) => {
  const rawText = [payload.discussion.title, payload.discussion.body ?? ""]
    .filter(Boolean)
    .join("\n\n");
  const promptText = buildDiscussionPrompt({
    title: payload.discussion.title ?? "",
    body: payload.discussion.body ?? "",
  });
  const clientThreadId = `github:discussion:${payload.repository.owner.login}/${payload.repository.name}#${payload.discussion.number}`;
  await respondIfNeeded({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    installationId: payload.installation?.id,
    sender: payload.sender,
    rawText,
    promptText,
    clientThreadId,
    postReply: (octokit, body) =>
      octokit.request(
        "POST /repos/{owner}/{repo}/discussions/{discussion_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          discussion_number: payload.discussion.number,
          body,
        }
      ),
  });
});

webhooks.on("discussion_comment.created", async ({ payload }) => {
  const rawText = payload.comment.body ?? "";
  const promptText = buildDiscussionPrompt({
    title: payload.discussion.title ?? "",
    body: payload.discussion.body ?? "",
    comment: payload.comment.body ?? "",
  });
  const clientThreadId = `github:discussion:${payload.repository.owner.login}/${payload.repository.name}#${payload.discussion.number}`;
  await respondIfNeeded({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    installationId: payload.installation?.id,
    sender: payload.sender,
    rawText,
    promptText,
    clientThreadId,
    postReply: (octokit, body) =>
      octokit.request(
        "POST /repos/{owner}/{repo}/discussions/{discussion_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          discussion_number: payload.discussion.number,
          body,
        }
      ),
  });
});

const server = express();
server.get("/", (req, res) => {
  res.json({ ok: true });
});
server.use(createNodeMiddleware(webhooks, { path: "/webhooks" }));
server.listen(port, () => {
  console.log(`GitHub bot listening on ${port}`);
});
