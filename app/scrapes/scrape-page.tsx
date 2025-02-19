import { Page } from "~/components/page";
import {
  Badge,
  Box,
  DataList,
  HStack,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import type { Route } from "./+types/scrape-page";
import { prisma } from "~/prisma";
import { getScrapeTitle } from "./util";
import { getAuthUser } from "~/auth/middleware";
import { TbSettings, TbWorld } from "react-icons/tb";
import moment from "moment";
import { SettingsSection } from "~/dashboard/settings";
import { Outlet, useFetcher, useNavigate } from "react-router";
import type { Prisma } from "@prisma/client";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { useState } from "react";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const items = await prisma.scrapeItem.findMany({
    where: { scrapeId: scrape.id },
    select: { id: true, url: true },
  });

  const tab = request.url.split(scrape.id)[1].substring(1);

  return { scrape, items, tab };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const formData = await request.formData();

  const chatPrompt = formData.get("chatPrompt") as string | null;
  const scrapeId = formData.get("scrapeId");

  const update: Prisma.ScrapeUpdateInput = {};
  if (chatPrompt) {
    update.chatPrompt = chatPrompt;
  }

  const scrape = await prisma.scrape.update({
    where: { id: scrapeId as string, userId: user!.id },
    data: update,
  });

  return { scrape };
}

export default function ScrapePage({ loaderData }: Route.ComponentProps) {
  
  const [tab, setTab] = useState<string>(loaderData.tab);
  const navigate = useNavigate();

  function handleTabChange(value: string) {
    setTab(value);
    navigate(`/collections/${loaderData.scrape.id}/${value}`);
  }

  return (
    <Page title={getScrapeTitle(loaderData.scrape)} icon={<TbWorld />}>
      <Stack>
        <DataList.Root orientation={"horizontal"}>
          <DataList.Item>
            <DataList.ItemLabel>Root URL</DataList.ItemLabel>
            <DataList.ItemValue>{loaderData.scrape.url}</DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Links scraped</DataList.ItemLabel>
            <DataList.ItemValue>
              <Badge variant={"surface"}>
                <TbWorld />
                {loaderData.items.length}
              </Badge>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Created</DataList.ItemLabel>
            <DataList.ItemValue>
              {moment(loaderData.scrape.createdAt).fromNow()}
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>

        <Box mt={6}>
          <SegmentedControl
            value={tab || "settings"}
            onValueChange={(e) => handleTabChange(e.value)}
            items={[
              {
                value: "settings",
                label: (
                  <HStack>
                    <TbSettings />
                    Settings
                  </HStack>
                ),
              },
              {
                value: "links",
                label: (
                  <HStack>
                    <TbWorld />
                    Links
                  </HStack>
                ),
              },
            ]}
          />
        </Box>

        <Stack>
          <Outlet />
        </Stack>
      </Stack>
    </Page>
  );
}
