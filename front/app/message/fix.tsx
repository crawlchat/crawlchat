import type { Route } from "./+types/fix";
import {
  TbAlertTriangle,
  TbArrowRight,
  TbCheck,
  TbEye,
  TbMessage,
  TbSettingsBolt,
} from "react-icons/tb";
import { Page } from "~/components/page";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { Link, redirect, useFetcher } from "react-router";
import { createToken } from "libs/jwt";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { makeMeta } from "~/meta";
import { makeMessagePairs } from "./analyse";
import type { ApiAction, ScrapeItem } from "libs/prisma";
import { QuestionAnswer } from "./message";
import { SettingsContainer, SettingsSection } from "~/settings-section";
import { useFetcherToast } from "~/dashboard/use-fetcher-toast";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
    },
  });

  if (!scrape) {
    throw redirect("/app");
  }

  const queryMessage = await prisma.message.findUnique({
    where: {
      id: params.messageId,
    },
  });

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      threadId: queryMessage?.threadId,
    },
    include: {
      thread: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const messagePairs = makeMessagePairs(messages);
  const messagePair = messagePairs.find(
    (pair) => pair.queryMessage?.id === params.messageId
  );

  const actions = await prisma.apiAction.findMany({
    where: {
      scrapeId,
    },
  });
  const actionsMap = new Map<string, ApiAction>(
    actions.map((action) => [action.id, action])
  );

  return { messagePairs, messagePair, actionsMap, scrape };
}

export function meta({ data }: Route.MetaArgs) {
  return makeMeta({
    title: "Fix message - CrawlChat",
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const answer = formData.get("answer");

  if (intent === "summarise") {
    const token = createToken(user!.id);

    const response = await fetch(`${process.env.VITE_SERVER_URL}/fix-message`, {
      method: "POST",
      body: JSON.stringify({
        messageId: params.messageId,
        answer,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    const error = response.status !== 200 ? data.error ?? data.message : null;

    return Response.json({ content: data.content, title: data.title, error });
  }

  if (intent === "save") {
    const token = createToken(user!.id);

    const title = formData.get("title");
    const content = formData.get("content");

    if (!title || !content) {
      return Response.json({ error: "Title and content are required" });
    }

    const message = await prisma.message.findUnique({
      where: {
        id: params.messageId,
      },
    });

    if (!message) {
      throw redirect("/app");
    }

    const markdown = `Updated on ${new Date().toLocaleDateString()}:
## ${title}

${content}`;

    const response = await fetch(
      `${process.env.VITE_SERVER_URL}/resource/${message.scrapeId}`,
      {
        method: "POST",
        body: JSON.stringify({
          title,
          markdown,
          defaultGroupTitle: "Answer corrections",
          knowledgeGroupType: "answer_corrections",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      const data = await response.json();
      return Response.json({ error: data.error ?? data.message });
    }

    const { scrapeItem } = (await response.json()) as {
      scrapeItem: ScrapeItem;
    };

    await prisma.message.update({
      where: {
        id: params.messageId,
      },
      data: {
        correctionItemId: scrapeItem.id,
      },
    });

    return {
      scrapeItem,
    };
  }
}

export default function FixMessage({ loaderData }: Route.ComponentProps) {
  const summarizeFetcher = useFetcher();
  const saveFetcher = useFetcher();

  useEffect(() => {
    if (summarizeFetcher.data?.error) {
      toast.error(summarizeFetcher.data.error);
    }
  }, [summarizeFetcher.data]);

  useEffect(() => {
    if (saveFetcher.data?.error) {
      toast.error(saveFetcher.data.error);
    }
  }, [saveFetcher.data]);

  useFetcherToast(saveFetcher, {
    title: "Saved",
    description: "Saved the answer to the knowledge base!",
  });

  return (
    <Page title="Fix message" icon={<TbSettingsBolt />}>
      <div className="flex flex-col gap-4 max-w-prose">
        {loaderData.messagePair && (
          <QuestionAnswer
            messagePair={loaderData.messagePair}
            actionsMap={loaderData.actionsMap}
          />
        )}

        {loaderData.messagePair?.queryMessage?.correctionItemId && (
          <div role="alert" className="alert alert-warning">
            <TbAlertTriangle />
            <span>
              This message is already corrected{" "}
              <Link
                className="link link-primary link-hover"
                to={`/knowledge/item/${loaderData.messagePair?.queryMessage?.correctionItemId}`}
              >
                here
              </Link>
            </span>
          </div>
        )}

        {saveFetcher.data?.scrapeItem ? (
          <SettingsSection
            title="Correct the answer"
            actionRight={
              <div className="flex flex-col md:flex-row gap-2 items-center">
                <p className="text-xs text-base-content/50 mr-4">
                  It takes a few seconds for the page to be indexed and
                  available for testing.
                </p>
                <Link
                  to={`/knowledge/item/${saveFetcher.data.scrapeItem.id}`}
                  className="btn"
                >
                  View the page
                  <TbEye />
                </Link>
                <Link
                  to={`/w/${loaderData.scrape.slug ?? loaderData.scrape.id}?q=${
                    loaderData.messagePair?.queryMessage?.llmMessage?.content
                  }`}
                  target="_blank"
                  className="btn btn-primary"
                >
                  Test it
                  <TbMessage />
                </Link>
              </div>
            }
            description="Saved the answer to the knowledge base!"
          />
        ) : summarizeFetcher.data?.title && summarizeFetcher.data?.content ? (
          <SettingsSection
            title="Correct the answer"
            fetcher={saveFetcher}
            saveLabel="Save it"
            savePrimary
            saveIcon={<TbCheck />}
            description="Give the correct answer and it will be added as a page to the knowledge base."
          >
            <div className="flex flex-col gap-2">
              <input type="hidden" name="intent" value="save" />
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Title</legend>
                <input
                  type="text"
                  placeholder="Ex: Price details"
                  className="input w-full"
                  name="title"
                  defaultValue={summarizeFetcher.data.title}
                  disabled={saveFetcher.state !== "idle"}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Answer</legend>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Answer to add as knowledge"
                  rows={4}
                  name="content"
                  defaultValue={summarizeFetcher.data.content}
                  disabled={saveFetcher.state !== "idle"}
                />
              </fieldset>
            </div>
          </SettingsSection>
        ) : (
          <SettingsSection
            title="Correct the answer"
            fetcher={summarizeFetcher}
            saveLabel="Summarise"
            savePrimary
            saveIcon={<TbArrowRight />}
            description="Give the correct answer and it will be added as a page to the knowledge base."
          >
            <input type="hidden" name="intent" value="summarise" />
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Enter the correct answer/fix here"
              rows={4}
              name="answer"
              disabled={saveFetcher.state !== "idle"}
            />
          </SettingsSection>
        )}
      </div>
    </Page>
  );
}
