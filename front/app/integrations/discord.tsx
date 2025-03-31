import {
  Group,
  Input,
  Stack,
  Text,
  IconButton,
  List,
  NumberInput,
  NativeSelect,
} from "@chakra-ui/react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/dashboard/profile";
import type { Route } from "./+types/discord";
import type { Prisma } from "libs/prisma";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { TbArrowRight, TbBrandDiscord, TbInfoCircle } from "react-icons/tb";
import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { getSessionScrapeId } from "~/scrapes/util";
import { Switch } from "~/components/ui/switch";
import { useState } from "react";
import { Field } from "~/components/ui/field";

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
  const discordServerId = formData.get("discordServerId") as string;

  const update: Prisma.ScrapeUpdateInput = {};

  if (discordServerId) {
    update.discordServerId = discordServerId;
  }

  if (formData.has("fromDiscordAnswer")) {
    const enabled = formData.get("discordAnswerEnabled") === "on";
    if (enabled) {
      const channelId =
        (formData.get("discordAnswerChannelId") as string) ?? "";
      const minScore =
        (formData.get("discordAnswerMinScore") as string) ?? "0.5";
      const emoji = (formData.get("discordAnswerEmoji") as string) ?? "✋🏻";
      update.discordAnswerConfig = {
        channels: [{ channelId }],
        minScore: parseFloat(minScore),
        emoji,
      };
    } else {
      update.discordAnswerConfig = null;
    }
  }

  const scrape = await prisma.scrape.update({
    where: { id: scrapeId },
    data: update,
  });

  return { scrape };
}

export default function ScrapeIntegrations({
  loaderData,
}: Route.ComponentProps) {
  const discordServerIdFetcher = useFetcher();
  const discordAnswerFetcher = useFetcher();
  const [discordAnswerEnabled, setDiscordAnswerEnabled] = useState(
    !!loaderData.scrape.discordAnswerConfig
  );

  return (
    <Stack gap={6}>
      <Text maxW={"900px"}>
        You have two Discord bots that you can install on your server with
        different bot names. Pick your favorite one from the following options
        and install. You need to enter the server id below to make it work!
      </Text>
      <Group>
        <Button asChild variant={"outline"}>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1346845279692918804"
            target="_blank"
          >
            <TbBrandDiscord />
            @CrawlChat
            <TbArrowRight />
          </a>
        </Button>
        <Button asChild variant={"outline"}>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1353765834321039502"
            target="_blank"
          >
            <TbBrandDiscord />
            @AiBot-CrawlChat
            <TbArrowRight />
          </a>
        </Button>
      </Group>
      <SettingsSection
        title={
          <Group>
            <Text>Discord Server Id</Text>
            <PopoverRoot>
              <PopoverTrigger asChild>
                <IconButton size={"xs"} variant={"ghost"}>
                  <TbInfoCircle />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                  <PopoverTitle fontWeight="medium">
                    Find server ID
                  </PopoverTitle>
                  <List.Root as="ol">
                    <List.Item>Go to "Server Settings"</List.Item>
                    <List.Item>Click on "Widget"</List.Item>
                    <List.Item>Copy the server ID</List.Item>
                  </List.Root>
                </PopoverBody>
              </PopoverContent>
            </PopoverRoot>
          </Group>
        }
        description="Integrate CrawlChat with your Discord server to bother answer the queries and also to learn from the conversations."
        fetcher={discordServerIdFetcher}
      >
        <Stack>
          <Input
            name="discordServerId"
            placeholder="Enter your Discord server ID"
            defaultValue={loaderData.scrape.discordServerId ?? ""}
            maxW={"400px"}
          />
        </Stack>
      </SettingsSection>

      <SettingsSection
        title={
          <Group>
            <Text>Reactive answer</Text>
            <PopoverRoot>
              <PopoverTrigger asChild>
                <IconButton size={"xs"} variant={"ghost"}>
                  <TbInfoCircle />
                </IconButton>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverBody>
                  <PopoverTitle fontWeight="medium">
                    Find channel ID
                  </PopoverTitle>
                  <List.Root as="ol">
                    <List.Item>Right click on channel</List.Item>
                    <List.Item>Click on "Copy URL"</List.Item>
                    <List.Item>Copy the last part of the URL</List.Item>
                    <List.Item>Paste it below</List.Item>
                  </List.Root>
                </PopoverBody>
              </PopoverContent>
            </PopoverRoot>
          </Group>
        }
        description="This features let's the Discord bot check every message if it is a question and the bot has a strong answer for it. If so, it reacts to the message so that your community knows it and replys @crawlchat to get the full answer."
        fetcher={discordAnswerFetcher}
      >
        <Stack gap={4}>
          <input type="hidden" name="fromDiscordAnswer" value={"true"} />
          <Switch
            name="discordAnswerEnabled"
            maxW={"400px"}
            defaultChecked={discordAnswerEnabled}
            onCheckedChange={(e) => setDiscordAnswerEnabled(e.checked)}
          >
            Enable
          </Switch>
          {discordAnswerEnabled && (
            <>
              <Field
                label="Channel Id"
                helperText="The channel id where the bot should check and react for messages if best answer found"
              >
                <Input
                  name="discordAnswerChannelId"
                  placeholder="Enter your Discord server ID"
                  defaultValue={
                    loaderData.scrape.discordAnswerConfig?.channels?.[0]
                      .channelId ?? ""
                  }
                  maxW={"400px"}
                />
              </Field>
              <Field
                label="Min Score"
                helperText="The minimum score required for the answer to be reactive"
              >
                <NumberInput.Root maxW={"400px"} w="full">
                  <NumberInput.Control>
                    <NumberInput.IncrementTrigger />
                    <NumberInput.DecrementTrigger />
                  </NumberInput.Control>
                  <NumberInput.Scrubber />
                  <NumberInput.Input
                    placeholder="Ex: 0.5"
                    name="discordAnswerMinScore"
                    defaultValue={
                      loaderData.scrape.discordAnswerConfig?.minScore ?? 0.5
                    }
                  />
                </NumberInput.Root>
              </Field>
              <NativeSelect.Root maxW="400px">
                <NativeSelect.Field
                  placeholder="Emoji"
                  name="discordAnswerEmoji"
                  defaultValue={
                    loaderData.scrape.discordAnswerConfig?.emoji ?? "✋🏻"
                  }
                >
                  <option value="✋🏻">✋🏻</option>
                  <option value="👍🏻">👍🏻</option>
                  <option value="😇">😇</option>
                  <option value="✌🏻">✌🏻</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </>
          )}
        </Stack>
      </SettingsSection>
    </Stack>
  );
}
