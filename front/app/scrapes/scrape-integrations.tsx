import {
  Group,
  Input,
  Stack,
  Text,
  IconButton,
  List,
  Box,
} from "@chakra-ui/react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/dashboard/profile";
import type { Route } from "./+types/scrape-integrations";
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

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  return { scrape };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  const formData = await request.formData();
  const discordServerId = formData.get("discordServerId") as string;

  const update: Prisma.ScrapeUpdateInput = {};

  if (discordServerId) {
    update.discordServerId = discordServerId;
  }

  const scrape = await prisma.scrape.update({
    where: { id: params.id },
    data: update,
  });

  return { scrape };
}

export default function ScrapeIntegrations({
  loaderData,
}: Route.ComponentProps) {
  const discordServerIdFetcher = useFetcher();
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
          />
        </Stack>
      </SettingsSection>
    </Stack>
  );
}
