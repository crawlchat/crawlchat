import crypto from "crypto";
import { Router } from "express";
import type { Express, Request, Response } from "express";
import type { Octokit } from "@octokit/core";
import { baseAnswerer } from "./answer";
import { fillMessageAnalysis } from "./analyse-message";
import { extractCitations } from "libs/citation";
import { createToken } from "libs/jwt";
import { consumeCredits, hasEnoughCredits } from "libs/user-plan";
import { getQueryString } from "libs/llm-message";
import { MessageRating, Thread, prisma } from "libs/prisma";

const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
const githubAppId = process.env.GITHUB_APP_ID;
const githubPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY;

let appAuth: any = null;

async function getAppAuth() {
  if (appAuth !== null) {
    return appAuth;
  }
  if (webhookSecret && githubAppId && githubPrivateKey) {
    const { createAppAuth } = await import("@octokit/auth-app");
    appAuth = createAppAuth({
      appId: githubAppId,
      privateKey: githubPrivateKey,
    });
    return appAuth;
  }
  return null;
}

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

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    throw new Error("Invalid GitHub signature");
  }
}

async function getOctokit(installationId: number) {
  const authInstance = await getAppAuth();
  if (!authInstance) {
    throw new Error("GitHub app authentication not configured");
  }

  const { Octokit } = await import("@octokit/core");
  const auth = await authInstance({
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

async function answer(data: {
  type: "discussion" | "issue";
  number: number;
  repoFullName: string;
  owner: string;
  repo: string;
  question: string;
  threadKey: string;
  installationId: number;
  title?: string;
  userId?: string;
}) {
  const scrape = await prisma.scrape.findFirst({
    where: { githubRepoName: data.repoFullName },
  });
  if (!scrape) {
    return console.error(
      `GitHub repo ${data.repoFullName} not found in CrawlChat`
    );
  }

  if (!data.question.trim()) {
    return;
  }

  if (
    !(await hasEnoughCredits(scrape.userId, "messages", {
      alert: {
        scrapeId: scrape.id,
        token: createToken(scrape.userId),
      },
    }))
  ) {
    return console.warn("Insufficient credits for GitHub reply");
  }

  const thread = await getThread(scrape.id, data.threadKey, data.title);

  const questionMessage = await prisma.message.create({
    data: {
      threadId: thread.id,
      scrapeId: scrape.id,
      ownerUserId: scrape.userId,
      channel: "github_discussion",
      llmMessage: {
        role: "user",
        content: data.question,
      },
      fingerprint: data.userId,
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

  const answerMessage = await prisma.message.create({
    data: {
      threadId: thread.id,
      scrapeId: scrape.id,
      ownerUserId: scrape.userId,
      channel: "github_discussion",
      llmMessage: {
        role: "assistant",
        content: answer.content,
      },
      links: answer.sources,
      creditsUsed: answer.creditsUsed,
      questionId: questionMessage.id,
      llmModel: scrape.llmModel,
      fingerprint: data.userId,
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

  const octokit = await getOctokit(data.installationId);

  let postResponse: GitHubPostResponse;
  if (data.type === "discussion") {
    postResponse = await postDiscussionComment(
      octokit,
      data.owner,
      data.repo,
      data.number,
      citation.content
    );
  } else {
    postResponse = await postIssueComment(
      octokit,
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
      rating: "none",
    },
  });

  await consumeCredits(scrape.userId, "messages", answer.creditsUsed);
}

export async function setupGitHubBot(app: Express) {
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
    processWebhook(event, payload);
  });

  if (await getAppAuth()) {
    app.use("/github", router);
  }
}

async function processWebhook(event: string, payload: any) {
  if (event === "discussion_comment" && payload.action === "created") {
    const comment = payload.comment;
    const discussion = payload.discussion;
    const repository = payload.repository;
    const installationId = payload.installation?.id;

    if (!containsMention(comment.body)) {
      return;
    }

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
        await answer({
          type: "discussion",
          number: discussion.number,
          repoFullName,
          owner,
          repo: repoName,
          question: comment.body ?? "",
          userId: comment.user.id,
          threadKey,
          title: discussion.title,
          installationId,
        });
      }
    }
  }

  if (event === "issue_comment" && payload.action === "created") {
    const comment = payload.comment;
    const issue = payload.issue;
    const repository = payload.repository;
    const installationId = payload.installation?.id;

    if (!containsMention(comment.body)) {
      return;
    }

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
        await answer({
          type: "issue",
          number: issue.number,
          repoFullName,
          owner,
          repo: repoName,
          question: comment.body ?? "",
          userId: comment.user.id,
          threadKey,
          title: issue.title,
          installationId,
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
      const questionText = issue.body?.trim() || issue.title?.trim() || "";

      if (repoFullName && owner && repoName && questionText) {
        const threadKey = `${repoFullName}#issue-${issue.number}`;
        await answer({
          type: "issue",
          number: issue.number,
          repoFullName,
          owner,
          repo: repoName,
          question: questionText,
          userId: issue.user.id,
          threadKey,
          title: issue.title,
          installationId,
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
          const octokit = await getOctokit(installationId);
          const isIssueComment = !!payload.issue;
          const endpoint = isIssueComment
            ? "GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"
            : "GET /repos/{owner}/{repo}/discussions/comments/{comment_id}/reactions";

          const reactionsResponse = await octokit.request(endpoint, {
            owner,
            repo: repoName,
            comment_id: comment.id,
            per_page: 100,
            headers: {
              accept: "application/vnd.github.squirrel-girl-preview+json",
            },
          });

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
