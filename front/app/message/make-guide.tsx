import { TbBook2, TbCheck } from "react-icons/tb";
import { getAuthUser } from "~/auth/middleware";
import { Page } from "~/components/page";
import { prisma } from "~/prisma";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import type { Route } from "./+types/make-guide";
import { ComposerSection, useComposer } from "~/compose";
import { getMessageContent } from "./messages";
import { useEffect } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findFirstOrThrow({
    where: { id: scrapeId },
  });

  const thread = await prisma.thread.findFirstOrThrow({
    where: { id: params.conversationId, scrapeId },
    include: {
      messages: true,
    },
  });

  return { thread, scrape };
}

export default function MakeGuide({ loaderData }: Route.ComponentProps) {
  const composer = useComposer({
    scrapeId: loaderData.scrape.id,
    prompt: `You are a helpful guide writer.
      You are given a conversation and you need to write a guide based on the conversation.

      It should be plain steps as markdown list or nested lists. No headings, no subheadings.
      Each step should not be more than 2 sentences.
      Don't use headings at all. It should be just pure bullet points.

      <conversation>
        ${loaderData.thread.messages
          .map(
            (message) =>
              `${message.llmMessage?.role}: ${getMessageContent(message)}`
          )
          .join("\n")}
      </conversation>`,
    init: {
      format: "markdown",
      formatText: `
        1. Go to <https://www.google.com>
        2. Click on the search icon
        3. Type "How to make a guide"
        4. Click on the search button
      `,
    },
    stateLess: true,
  });

  useEffect(() => {
    setTimeout(() => {
      composer.askEdit("Make a guide");
    }, 100);
  }, []);

  return (
    <Page
      title="Make a guide"
      icon={<TbBook2 />}
      right={
        <button className="btn btn-primary">
          Publish
          <TbCheck />
        </button>
      }
    >
      <ComposerSection composer={composer} />
    </Page>
  );
}
