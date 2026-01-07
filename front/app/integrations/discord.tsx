import type { Route } from "./+types/discord";
import type { Prisma } from "libs/prisma";
import { useFetcher, useLoaderData } from "react-router";
import {
  SettingsContainer,
  SettingsSection,
  SettingsSectionProvider,
} from "~/components/settings-section";
import { prisma } from "libs/prisma";
import { getAuthUser } from "~/auth/middleware";
import {
  TbArrowRight,
  TbBrandDiscord,
  TbCrown,
  TbInfoCircle,
} from "react-icons/tb";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { MultiSelect } from "~/components/multi-select";
import { useState } from "react";
import { makeMeta } from "~/meta";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId },
    include: {
      user: true,
    },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  return { scrape };
}

export function meta({ data }: Route.MetaArgs) {
  return makeMeta({
    title: "Discord - CrawlChat",
  });
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();

  const scrape = await prisma.scrape.findFirstOrThrow({
    where: { id: scrapeId },
  });

  const update: Prisma.ScrapeUpdateInput = {};

  if (formData.has("discordServerId")) {
    update.discordServerId = formData.get("discordServerId") as string;
  }

  if (formData.has("fromDiscordDraft")) {
    const enabled = formData.get("discordDraftEnabled") === "on";
    if (enabled) {
      const sourceChannelId = formData.get(
        "discordDraftSourceChannelId"
      ) as string;
      const emoji = formData.get("discordDraftEmoji") as string;
      const destinationChannelId = formData.get(
        "discordDraftDestinationChannelId"
      ) as string;

      if (!sourceChannelId || !destinationChannelId || !emoji) {
        return { error: "All fields are required" };
      }

      update.discordDraftConfig = {
        sourceChannelIds: [sourceChannelId],
        destinationChannelId: destinationChannelId,
        emoji,
      };
    } else {
      update.discordDraftConfig = null;
    }
  }

  if (formData.has("from-reply-as-thread")) {
    update.discordConfig = {
      ...(scrape!.discordConfig! as any),
      replyAsThread: formData.get("replyAsThread") === "on",
    };
  }

  if (formData.has("onlyChannelNames")) {
    update.discordConfig = {
      ...(scrape!.discordConfig! as any),
      onlyChannelNames: formData.get("onlyChannelNames") as string,
    };
  }

  if (formData.has("from-send-images")) {
    update.discordConfig = {
      ...(scrape!.discordConfig! as any),
      sendImages: formData.get("sendImages") === "on",
    };
  }

  const updatedScrape = await prisma.scrape.update({
    where: { id: scrapeId },
    data: update,
  });

  return { scrape: updatedScrape };
}

function ChannelNames() {
  const { scrape } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [value, setValue] = useState<string[]>(
    scrape.discordConfig?.onlyChannelNames?.split(",") ?? []
  );

  return (
    <SettingsSection
      id="channel-names"
      title="Channel names"
      description="Configure the channels from which the bot will answer the queries. If none mentioned, it will answer everywhere on the server."
      fetcher={fetcher}
    >
      <input type="hidden" name="onlyChannelNames" value={value.join(",")} />
      <MultiSelect
        placeholder="Ex: ask-ai, help, etc."
        value={value}
        onChange={(value) => {
          setValue(value);
        }}
      />
    </SettingsSection>
  );
}

function ImageAttachments() {
  const { scrape } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  function isAllowed(plans: string[]) {
    return plans.includes(scrape.user.plan?.planId ?? "free");
  }

  return (
    <SettingsSection
      id="image-attachments"
      title="Image attachments"
      description="Should the bot send the attached images to the bot? Very helpful when users attach screenshots and ask questions about them. Make sure the AI model supports image inputs."
      fetcher={fetcher}
    >
      <div className="flex gap-2">
        <input type="hidden" name="from-send-images" value="on" />
        <label className="label">
          <input
            type="checkbox"
            name="sendImages"
            className="toggle"
            defaultChecked={scrape.discordConfig?.sendImages ?? false}
            disabled={!isAllowed(["pro"])}
          />
          Active
        </label>
        <div className="badge badge-soft badge-primary">
          <TbCrown /> Pro
        </div>
      </div>
    </SettingsSection>
  );
}

export default function DiscordIntegrations({
  loaderData,
}: Route.ComponentProps) {
  const discordServerIdFetcher = useFetcher();
  const replyAsThreadFetcher = useFetcher();

  return (
    <SettingsSectionProvider>
      <SettingsContainer>
        <div className="text-base-content/50">
          You have two Discord bots that you can install on your server with
          different bot names. Pick your favorite one from the following options
          and install. You need to enter the server id below to make it work!
        </div>
        <div className="flex items-center gap-2">
          <a
            className="btn btn-neutral"
            href="https://discord.com/oauth2/authorize?client_id=1346845279692918804"
            target="_blank"
          >
            <TbBrandDiscord />
            @CrawlChat
            <TbArrowRight />
          </a>

          <a
            className="btn btn-neutral"
            href="https://discord.com/oauth2/authorize?client_id=1353765834321039502"
            target="_blank"
          >
            <TbBrandDiscord />
            @AiBot-CrawlChat
            <TbArrowRight />
          </a>
        </div>

        <SettingsSection
          id="discord-server-id"
          plainTitle="Server Id"
          title={
            <div className="flex items-center gap-2">
              <span>Discord Server Id</span>
              <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-xs mb-1">
                  <TbInfoCircle />
                </div>
                <div
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-4 shadow-sm"
                >
                  <ol className="list-decimal list-inside">
                    <li>Go to "Server Settings"</li>
                    <li>Click on "Widget"</li>
                    <li>Copy the server ID</li>
                  </ol>
                </div>
              </div>
            </div>
          }
          description="Integrate CrawlChat with your Discord server to bother answer the queries and also to learn from the conversations."
          fetcher={discordServerIdFetcher}
        >
          <input
            className="input w-full"
            name="discordServerId"
            placeholder="Enter your Discord server ID"
            defaultValue={loaderData.scrape.discordServerId ?? ""}
          />
        </SettingsSection>

        <ChannelNames />

        <SettingsSection
          id="reply-as-thread"
          title="Reply as thread"
          description="Reply to messages as threads instead of just sending it as reply. Keeps the channel clutter free and better organization."
          fetcher={replyAsThreadFetcher}
        >
          <input type="hidden" name="from-reply-as-thread" value="on" />
          <label className="label">
            <input
              type="checkbox"
              name="replyAsThread"
              className="toggle"
              defaultChecked={
                loaderData.scrape.discordConfig?.replyAsThread ?? false
              }
            />
            Active
          </label>
        </SettingsSection>

        <ImageAttachments />
      </SettingsContainer>
    </SettingsSectionProvider>
  );
}
