import { Group, Input, Stack, Text } from "@chakra-ui/react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/settings-section";
import type { Route } from "./+types/discord";
import type { Prisma } from "libs/prisma";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { TbArrowRight, TbBrandSlack } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { getSessionScrapeId } from "~/scrapes/util";
import { useEffect, useState } from "react";
import { toaster } from "~/components/ui/toaster";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  return { scrape };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const formData = await request.formData();

  const update: Prisma.ScrapeUpdateInput = {};

  if (formData.has("slackTeamId")) {
    update.slackTeamId = formData.get("slackTeamId") as string;
  }

  const scrape = await prisma.scrape.update({
    where: { id: scrapeId, userId: user!.id },
    data: update,
  });

  return { scrape };
}

export default function ScrapeIntegrations({
  loaderData,
}: Route.ComponentProps) {
  const discordServerIdFetcher = useFetcher();
  const discordDraftFetcher = useFetcher();
  const [discordDraftEnabled, setDiscordDraftEnabled] = useState(
    !!loaderData.scrape.discordDraftConfig
  );

  useEffect(() => {
    if (discordDraftFetcher.data?.error) {
      toaster.error({
        title: "Error",
        description: discordDraftFetcher.data.error,
      });
    }
  }, [discordDraftFetcher.data]);

  return (
    <Stack gap={6}>
      <Text maxW={"900px"}>
        You can install CrawlChat bot on your Slack workspace. You need to first
        set the team id below to make it work!
      </Text>
      <Group>
        <Button asChild variant={"solid"}>
          <a
            href="https://guides.crawlchat.app/guide/get-the-team-id-for-slack-app-integration-28"
            target="_blank"
          >
            How to find team id?
          </a>
        </Button>
        <Button asChild variant={"outline"}>
          <a href="https://slack.crawlchat.app/install" target="_blank">
            <TbBrandSlack />
            Install @CrawlChat
            <TbArrowRight />
          </a>
        </Button>
      </Group>
      <SettingsSection
        id="slack-team-id"
        title={"Slack Team Id"}
        description="Slack team id is unique to your workspace. You can find it in the URL of your workspace."
        fetcher={discordServerIdFetcher}
      >
        <Stack>
          <Input
            name="slackTeamId"
            placeholder="Ex: T060PNXZXXX"
            defaultValue={loaderData.scrape.slackTeamId ?? ""}
            maxW={"400px"}
          />
        </Stack>
      </SettingsSection>
    </Stack>
  );
}
