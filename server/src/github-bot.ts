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
  return Boolean(text && text.trim().startsWith("@crawlchat"));
}


function verifySignature(req: Request) {
  if (!webhookSecret) {
    throw new Error("GitHub webhook secret not configured");
  }

  const signature = req.headers["x-hub-signature-256"] as string | undefined;
  if (!signature) {
    throw new Error("Missing GitHub signature");
  }

  let body: Buffer | string;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (rawBody) {
    body = rawBody;
  } else if (req.body) {
    body = JSON.stringify(req.body);
  } else {
    throw new Error("Missing request body for signature verification");
  }

  const digest = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  const expectedSignature = `sha256=${digest}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid GitHub signature");
  }
}

async function getInstallationOctokit(
  installationId: number
): Promise<Octokit> {
  if (!appAuth) {
    throw new Error("GitHub bot: No app authentication available. Make sure GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY are set.");
  }
  const auth = await appAuth({
    type: "installation",
    installationId,
  });
  return new Octokit({ auth: auth.token });
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
  const scrape = await prisma.scrape.findFirst({
    where: { githubRepoName: data.repoFullName },
  });
  if (!scrape) {
    console.warn(`GitHub bot: No scrape found for repository "${data.repoFullName}". Make sure you've configured this repository in your CrawlChat GitHub bot settings.`);
    return;
  }

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

  await prisma.thread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date() },
  });

  const actions = await prisma.apiAction.findMany({
    where: { scrapeId: scrape.id },
  });

  const answer = await baseAnswerer(scrape, thread, data.question, [], {
    channel: "github_discussion",
    actions,
  });

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

  await prisma.thread.update({
    where: { id: thread.id },
    data: { lastMessageAt: new Date() },
  });

  if (scrape.analyseMessage) {
    fillMessageAnalysis(
      answerMessage.id,
      questionMessage.id,
      getQueryString(data.question),
      answer.content,
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

  let postResponse: GitHubPostResponse;
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


  await prisma.message.update({
    where: { id: answerMessage.id },
    data: {
      githubCommentId: String(postResponse.id),
      url: postResponse.html_url,
      rating: "none" as MessageRating,
    },
  });

  await consumeCredits(scrape.userId, "messages", answer.creditsUsed);
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

    res.json({ ok: true });
    processWebhookAsync(event, payload).catch((error) => {
      console.error("Failed to process GitHub webhook asynchronously", error);
    });
  });

  if (appAuth) {
    app.use("/github", router);
  }
}

async function processWebhookAsync(event: string, payload: any) {
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
        repository.full_name &&
        issue.user &&
        issue.user.type?.toLowerCase?.() !== "bot" &&
        !issue.user.login?.endsWith?.("[bot]")
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
            const isIssueComment = !!payload.issue;
            const endpoint = isIssueComment
              ? "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
              : "GET /repos/{owner}/{repo}/discussions/comments/{comment_id}/reactions";

            const reactionsResponse = await installationOctokit.request(
              endpoint,
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
          }
        }
      }
    }
}
