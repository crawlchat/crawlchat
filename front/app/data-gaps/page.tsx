import type { Route } from "./+types/page";
import type { Message } from "libs/prisma";
import {
  TbChartBarOff,
  TbCheck,
  TbCopy,
  TbMessage,
  TbTrash,
  TbX,
} from "react-icons/tb";
import { Page } from "~/components/page";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";
import { prisma } from "libs/prisma";
import { MarkdownProse } from "~/widget/markdown-prose";
import { Link, useFetcher } from "react-router";
import { fetchDataGaps } from "./fetch";
import { EmptyState } from "~/components/empty-state";
import cn from "@meltdownjs/cn";
import { Timestamp } from "~/components/timestamp";
import toast from "react-hot-toast";
import { makeMeta } from "~/meta";
import { useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const messages = await fetchDataGaps(scrapeId);

  return { messages };
}

export function meta() {
  return makeMeta({
    title: "Data gaps - CrawlChat",
  });
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "done") {
    const messageId = formData.get("messageId") as string;
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        analysis: {
          upsert: {
            set: {
              dataGapDone: true,
            },
            update: {
              dataGapDone: true,
            },
          },
        },
      },
    });

    return { success: true };
  }

  if (intent === "cancel") {
    const messageId = formData.get("messageId") as string;
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        analysis: {
          upsert: {
            set: {
              dataGapCancelled: true,
            },
            update: {
              dataGapCancelled: true,
            },
          },
        },
      },
    });

    return { success: true };
  }
}

export function DataGapCard({ message }: { message: Message }) {
  const doneFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `# ${message.analysis!.dataGapTitle}\n\n${
        message.analysis!.dataGapDescription
      }`
    );
    toast.success("Copied to clipboard");
  };

  return (
    <div
      className={cn(
        "p-4 rounded-box bg-base-100 shadow",
        "border border-base-300"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 justify-between">
          <div>
            <div>{message.analysis!.dataGapTitle}</div>
            <Timestamp
              date={message.createdAt}
              className="text-base-content/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="join">
              <Link
                className="btn btn-square join-item"
                to={`/questions/${message.questionId}`}
              >
                <TbMessage />
              </Link>

              <button className="btn btn-square join-item" onClick={handleCopy}>
                <TbCopy />
              </button>
            </div>

            <div className="join">
              <doneFetcher.Form method="post">
                <input type="hidden" name="messageId" value={message.id} />
                <input type="hidden" name="intent" value="done" />
                <button
                  className="btn btn-success btn-soft join-item"
                  type="submit"
                  disabled={doneFetcher.state !== "idle"}
                >
                  <TbCheck />
                  Accept
                </button>
              </doneFetcher.Form>
              <deleteFetcher.Form method="post">
                <input type="hidden" name="messageId" value={message.id} />
                <input type="hidden" name="intent" value="cancel" />
                <div
                  className="tooltip tooltip-left"
                  data-tip="Cancel it so that similar data gaps are not created again"
                >
                  <button
                    className="btn btn-error btn-soft join-item"
                    disabled={deleteFetcher.state !== "idle"}
                    type="submit"
                  >
                    <TbX />
                    Cancel
                  </button>
                </div>
              </deleteFetcher.Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DataGapsPage({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Data gaps" icon={<TbChartBarOff />}>
      {loaderData.messages.length === 0 && (
        <div className="w-full h-full flex justify-center items-center">
          <EmptyState
            icon={<TbCheck />}
            title="No data gaps"
            description="You are sorted! There are no data gaps found in the last week. If you have not yet integrated the chatbot, integrate it now so it finds the data gaps automatically."
          />
        </div>
      )}
      {loaderData.messages.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-base-content/50">
            These topics were asked but not found in the knowledge base. Review
            each one and either add it to your knowledge base or cancel it if
            it's not relevant.
          </div>
          <div className="flex flex-col gap-4">
            {loaderData.messages.map((message) => (
              <DataGapCard key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}
