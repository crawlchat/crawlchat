import crypto from "crypto";
import { Router } from "express";
import type { Express, Request, Response } from "express";
import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { baseAnswerer } from "./answer";
import { fillMessageAnalysis } from "./analyse-message";
import { extractCitations } from "libs/citation";
import { createToken } from "libs/jwt";
import { consumeCredits, hasEnoughCredits } from "libs/user-plan";
import { getQueryString } from "libs/llm-message";
import {
  MessageChannel,
  MessageRating,
  Thread,
  prisma,
} from "libs/prisma";

const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const githubAppId = Number(process.env.GITHUB_APP_ID ?? 0);
const githubPrivateKey = (process.env.GITHUB_APP_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n"
);
const hasAppCredentials = githubAppId > 0 && githubPrivateKey.length > 0;
console.log(`GitHub bot: App credentials configured: ${hasAppCredentials} (App ID: ${githubAppId > 0 ? 'set' : 'not set'}, Private key length: ${githubPrivateKey.length})`);
console.log(`GitHub bot: Private key starts with: ${githubPrivateKey.substring(0, 30)}...`);
console.log(`GitHub bot: Private key contains ${githubPrivateKey.split('\n').length} lines`);
console.log(`GitHub bot: Private key ends with: ...${githubPrivateKey.substring(githubPrivateKey.length - 30).replace(/\n/g, '\\n')}`);

const appAuth = hasAppCredentials
  ? createAppAuth({
      appId: githubAppId,
      privateKey: githubPrivateKey,
    })
  : null;

type GitHubQuestionType = "discussion" | "issue";

type GitHubQuestionRequest = {
  type: GitHubQuestionType;
  number: number;
  repoFullName: string;
  owner: string;
  repo: string;
  question: string;
  mention: boolean;
  threadKey: string;
  title?: string;
  installationId: number;
};

type GitHubPostResponse = {
  id: number;
  html_url: string;
};

function containsMention(text?: string | null) {
  return Boolean(text && /@crawlchat\b/i.test(text));
}

function getApiKeySource(model: string): string {
  // This mirrors the logic in getConfig function
  if (model === "o3_mini" || model === "o4_mini") return "OPENAI_API_KEY";
  if (model === "sonnet_3_5" || model === "sonnet_3_7") return "ANTHROPIC_API_KEY";
  if (model === "gemini_2_5_flash" || model === "gemini_2_5_flash_lite") return "GEMINI_API_KEY";
  if (model === "gpt_5_nano" || model === "gpt_5_mini" || model === "gpt_5" || model === "sonnet_4_5" || model === "haiku_4_5") return "OPENROUTER_API_KEY";
  return "OPENAI_API_KEY"; // default
}

function verifySignature(req: Request) {
  if (!webhookSecret) {
    console.log("GitHub webhook: No webhook secret configured, skipping verification");
    return;
  }

  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature) {
    console.log("GitHub webhook: Missing x-hub-signature-256 header");
    throw new Error("Missing GitHub signature");
  }

  console.log(`GitHub webhook: Verifying signature: ${signature.substring(0, 20)}...`);

  // Use raw body if available, otherwise reconstruct from parsed body
  let body: Buffer | string;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (rawBody) {
    console.log(`GitHub webhook: Using raw body (${rawBody.length} bytes)`);
    body = rawBody;
  } else if (req.body) {
    // If body is already parsed, reconstruct the JSON string
    body = JSON.stringify(req.body);
    console.log(`GitHub webhook: Using reconstructed body (${body.length} chars)`);
  } else {
    throw new Error("Missing request body for signature verification");
  }

  const digest = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  // GitHub signature format is "sha256=<hex_digest>"
  const expectedSignature = `sha256=${digest}`;

  console.log(`GitHub webhook: Expected signature: ${expectedSignature.substring(0, 20)}...`);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.log("GitHub webhook: Signature mismatch!");
    throw new Error("Invalid GitHub signature");
  }

  console.log("GitHub webhook: Signature verified successfully");
}

async function getInstallationOctokit(
  installationId: number
): Promise<Octokit | null> {
  if (!appAuth) {
    console.error("GitHub bot: No app authentication available. Make sure GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are set.");
    return null;
  }
  try {
    console.log(`GitHub bot: Creating installation auth for installation ID: ${installationId}`);
    const auth = await appAuth({
      type: "installation",
      installationId,
    });
    console.log(`GitHub bot: Successfully created installation auth`);
    return new Octokit({ auth: auth.token });
  } catch (error) {
    console.error(`GitHub bot: Failed to create installation auth for ID ${installationId}:`, error);
    return null;
  }
}

async function touchThread(threadId: string) {
  await prisma.thread.update({
    where: { id: threadId },
    data: { lastMessageAt: new Date() },
  });
}

async function getThread(
  scrapeId: string,
  key: string,
  title?: string
): Promise<Thread> {
  let thread = await prisma.thread.findFirst({
    where: { scrapeId, clientThreadId: key },
  });
  if (!thread) {
    thread = await prisma.thread.create({
      data: {
        scrapeId,
        clientThreadId: key,
        title,
      },
    });
  }
  return thread;
}

async function postDiscussionComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  discussionNumber: number,
  body: string
): Promise<GitHubPostResponse> {
  const response = await octokit.request(
    "POST /repos/{owner}/{repo}/discussions/{discussion_number}/comments",
    {
      owner,
      repo,
      discussion_number: discussionNumber,
      body,
    }
  );
  return response.data as GitHubPostResponse;
}

async function postIssueComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
): Promise<GitHubPostResponse> {
  const response = await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      owner,
      repo,
      issue_number: issueNumber,
      body,
    }
  );
  return response.data as GitHubPostResponse;
}

async function answerGitHubQuestion(data: GitHubQuestionRequest) {
  console.log(`GitHub bot: Looking for scrape with githubRepoName: "${data.repoFullName}"`);
  const scrape = await prisma.scrape.findFirst({
    where: { githubRepoName: data.repoFullName },
  });
  if (!scrape) {
    console.log(`GitHub bot: No scrape found for repository "${data.repoFullName}". Make sure you've configured this repository in your CrawlChat GitHub bot settings.`);
    return;
  }
  console.log(`GitHub bot: Found scrape ${scrape.id} for repository "${data.repoFullName}"`);
  console.log(`GitHub bot: Scrape model: ${scrape.llmModel || 'default'}, userId: ${scrape.userId}`);

  if (
    !(
      await hasEnoughCredits(scrape.userId, "messages", {
        alert: {
          scrapeId: scrape.id,
          token: createToken(scrape.userId),
        },
      })
    )
  ) {
    console.warn("Insufficient credits for GitHub reply");
    return;
  }

  if (!data.question.trim()) {
    return;
  }

  const thread = await getThread(scrape.id, data.threadKey, data.title);

  const questionMessage = await prisma.message.create({
    data: {
      threadId: thread.id,
      scrapeId: scrape.id,
      ownerUserId: scrape.userId,
      channel: "github_discussion" as MessageChannel,
      llmMessage: {
        role: "user",
        content: data.question,
      },
      fingerprint: data.mention ? "mention" : undefined,
    },
  });

  await touchThread(thread.id);

  const actions = await prisma.apiAction.findMany({
    where: { scrapeId: scrape.id },
  });

  console.log(`GitHub bot: About to call baseAnswerer with model: ${scrape.llmModel || 'default (gpt-4o-mini)'}`);
  const apiKeySource = scrape.llmModel ? getApiKeySource(scrape.llmModel) : 'OPENAI_API_KEY';
  console.log(`GitHub bot: Expected API key source: ${apiKeySource}`);
  const keyPrefix = process.env[apiKeySource]?.substring(0, 8) || 'not set';
  console.log(`GitHub bot: API key starts with: ${keyPrefix}...`);

  const answer = await baseAnswerer(scrape, thread, data.question, [], {
    channel: "github_discussion",
    actions,
  });

  await consumeCredits(scrape.userId, "messages", answer.creditsUsed);

  const shouldReply = data.mention || (answer.context?.length ?? 0) > 0;
  if (!shouldReply) {
    console.info("Skipping GitHub reply: no relevant context and no mention.");
    return;
  }

  const answerMessage = await prisma.message.create({
    data: {
      threadId: thread.id,
      scrapeId: scrape.id,
      ownerUserId: scrape.userId,
      channel: "github_discussion" as MessageChannel,
      llmMessage: {
        role: "assistant",
        content: answer.content,
      },
      links: answer.sources,
      creditsUsed: answer.creditsUsed,
      questionId: questionMessage.id,
      llmModel: scrape.llmModel,
    },
  });

  await prisma.message.update({
    where: { id: questionMessage.id },
    data: { answerId: answerMessage.id },
  });

  await touchThread(thread.id);

  if (scrape.analyseMessage) {
    fillMessageAnalysis(
      answerMessage.id,
      questionMessage.id,
      getQueryString(data.question),
      answer.content,
      answer.sources,
      answer.context,
      {
        categories: scrape.messageCategories,
      }
    );
  }

  const citation = extractCitations(answer.content, answer.sources, {
    cleanCitations: true,
    addSourcesToMessage: false,
  });

  const installationOctokit = await getInstallationOctokit(data.installationId);
  if (!installationOctokit) {
    console.warn("Skipping GitHub reply: no installation auth available");
    return;
  }

  let postResponse: GitHubPostResponse | null = null;
  try {
    if (data.type === "discussion") {
      postResponse = await postDiscussionComment(
        installationOctokit,
        data.owner,
        data.repo,
        data.number,
        citation.content
      );
    } else {
      postResponse = await postIssueComment(
        installationOctokit,
        data.owner,
        data.repo,
        data.number,
        citation.content
      );
    }
  } catch (error) {
    console.error("Failed to post GitHub comment", error);
    return;
  }

  if (!postResponse) {
    return;
  }

  await prisma.message.update({
    where: { id: answerMessage.id },
    data: {
      githubCommentId: String(postResponse.id),
      url: postResponse.html_url,
      rating: "none" as MessageRating,
    },
  });
}

export function setupGithubBot(app: Express) {
  const router = Router();

  router.post("/webhook", async (req: Request, res: Response) => {
    try {
      verifySignature(req);
    } catch (error) {
      console.warn("GitHub webhook signature failed:", error);
      res.status(401).json({ message: "Invalid signature" });
      return;
    }

    const event = req.headers["x-github-event"] as string | undefined;
    const payload = req.body;

    if (!event || !payload) {
      res.status(400).json({ message: "Invalid payload" });
      return;
    }

    if (event === "discussion_comment" && payload.action === "created") {
      const comment = payload.comment;
      const discussion = payload.discussion;
      const repository = payload.repository;
      const installationId = payload.installation?.id;

      if (
        comment &&
        discussion &&
        repository &&
        installationId &&
        comment.user &&
        discussion.number
      ) {
        const repoFullName = repository.full_name;
        const owner = repository.owner?.login;
        const repoName = repository.name;

        if (
          repoFullName &&
          owner &&
          repoName &&
          comment.user.type?.toLowerCase?.() !== "bot" &&
          !comment.user.login?.endsWith?.("[bot]")
        ) {
          const threadKey = `${repoFullName}-discussion-${discussion.number}`;
          await answerGitHubQuestion({
            type: "discussion",
            number: discussion.number,
            repoFullName,
            owner,
            repo: repoName,
            question: comment.body ?? "",
            mention: containsMention(comment.body),
            threadKey,
            title: discussion.title,
            installationId,
          }).catch((error) => {
            console.error("Failed to handle discussion comment", error);
          });
        }
      }
    }

    if (event === "issue_comment" && payload.action === "created") {
      const comment = payload.comment;
      const issue = payload.issue;
      const repository = payload.repository;
      const installationId = payload.installation?.id;

      if (
        comment &&
        issue &&
        repository &&
        installationId &&
        issue.number &&
        comment.user
      ) {
        const repoFullName = repository.full_name;
        const owner = repository.owner?.login;
        const repoName = repository.name;

        if (
          repoFullName &&
          owner &&
          repoName &&
          comment.user.type?.toLowerCase?.() !== "bot" &&
          !comment.user.login?.endsWith?.("[bot]")
        ) {
          const threadKey = `${repoFullName}#issue-${issue.number}`;
          await answerGitHubQuestion({
            type: "issue",
            number: issue.number,
            repoFullName,
            owner,
            repo: repoName,
            question: comment.body ?? "",
            mention: containsMention(comment.body),
            threadKey,
            title: issue.title,
            installationId,
          }).catch((error) => {
            console.error("Failed to handle issue comment", error);
          });
        }
      }
    }

    if (event === "issues" && payload.action === "opened") {
      const issue = payload.issue;
      const repository = payload.repository;
      const installationId = payload.installation?.id;

      if (
        issue &&
        repository &&
        installationId &&
        issue.number &&
        repository.full_name
      ) {
        const repoFullName = repository.full_name;
        const owner = repository.owner?.login;
        const repoName = repository.name;
        const questionText =
          issue.body?.trim() || issue.title?.trim() || "";

        if (repoFullName && owner && repoName && questionText) {
          const threadKey = `${repoFullName}#issue-${issue.number}`;
          await answerGitHubQuestion({
            type: "issue",
            number: issue.number,
            repoFullName,
            owner,
            repo: repoName,
            question: questionText,
            mention: containsMention(issue.body),
            threadKey,
            title: issue.title,
            installationId,
          }).catch((error) => {
            console.error("Failed to handle issue", error);
          });
        }
      }
    }

    if (
      event === "reaction" &&
      payload.action &&
      ["created", "deleted"].includes(payload.action)
    ) {
      const comment = payload.comment;
      const repository = payload.repository;
      const installationId = payload.installation?.id;

      if (comment && repository && installationId) {
        const repoFullName = repository.full_name;
        const owner = repository.owner?.login;
        const repoName = repository.name;

        if (repoFullName && owner && repoName) {
          const message = await prisma.message.findFirst({
            where: {
              githubCommentId: String(comment.id),
              channel: "github_discussion",
            },
          });

          if (message) {
            const installationOctokit = await getInstallationOctokit(
              installationId
            );
            if (installationOctokit) {
              try {
                const reactionsResponse = await installationOctokit.request(
                  "GET /repos/{owner}/{repo}/discussions/comments/{comment_id}/reactions",
                  {
                    owner,
                    repo: repoName,
                    comment_id: comment.id,
                    per_page: 100,
                    headers: {
                      accept:
                        "application/vnd.github.squirrel-girl-preview+json",
                    },
                  }
                );

                const thumbsUp = (reactionsResponse.data as any[]).filter(
                  (reaction) => reaction.content === "+1"
                ).length;
                const thumbsDown = (reactionsResponse.data as any[]).filter(
                  (reaction) => reaction.content === "-1"
                ).length;

                let rating: MessageRating = "none";
                if (thumbsDown >= thumbsUp && thumbsDown > 0) {
                  rating = "down";
                } else if (thumbsUp > 0) {
                  rating = "up";
                }

                await prisma.message.update({
                  where: { id: message.id },
                  data: {
                    rating,
                  },
                });
              } catch (error) {
                console.error("Failed to fetch GitHub reactions", error);
              }
            }
          }
        }
      }
    }

    res.json({ ok: true });
  });

  app.use("/github", router);
}
