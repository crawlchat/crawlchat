import { prisma } from "libs/prisma";
import { getAuthUser } from "~/auth/middleware";
import { getSessionScrapeId } from "~/scrapes/util";
import type { Route } from "./+types/page";
import { Page } from "~/components/page";
import {
  TbBook2,
  TbBrandDiscord,
  TbBrandGithub,
  TbSettings,
  TbWorld,
} from "react-icons/tb";
import { Box, HStack, Stack } from "@chakra-ui/react";
import { SegmentedControl } from "~/components/ui/segmented-control";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useMemo } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: { id: scrapeId, userId: user!.id },
  });

  if (!scrape) {
    throw new Response("Not found", { status: 404 });
  }

  const knowledgeGroup = await prisma.knowledgeGroup.findUnique({
    where: { id: params.groupId, userId: user!.id },
  });

  if (!knowledgeGroup) {
    throw new Response("Not found", { status: 404 });
  }

  return { scrape, knowledgeGroup };
}

export default function KnowledgeGroupPage({
  loaderData,
}: Route.ComponentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = useMemo(() => {
    return location.pathname;
  }, [location.pathname]);
  const tabs = useMemo(() => {
    return [
      {
        value: `/knowledge/group/${loaderData.knowledgeGroup.id}`,
        label: "Settings",
        icon: <TbSettings />,
      },
      {
        value: `/knowledge/group/${loaderData.knowledgeGroup.id}/items`,
        label: "Knowledge items",
        icon: <TbBook2 />,
      },
    ];
  }, [loaderData.knowledgeGroup.id]);

  function handleTabChange(value: string) {
    navigate(value);
  }

  function getIcon() {
    if (loaderData.knowledgeGroup.type === "scrape_github") {
      return <TbBrandGithub />;
    }

    if (loaderData.knowledgeGroup.type === "scrape_web") {
      return <TbWorld />;
    }

    if (loaderData.knowledgeGroup.type === "learn_discord") {
      return <TbBrandDiscord />;
    }

    return <TbBook2 />;
  }

  return (
    <Page
      title={loaderData.knowledgeGroup.title ?? "Untitled"}
      icon={getIcon()}
    >
      <Stack gap={6}>
        <Box>
          <SegmentedControl
            value={tab || tabs[0].value}
            onValueChange={(e) => handleTabChange(e.value)}
            items={tabs.map((tab) => ({
              ...tab,
              label: (
                <HStack>
                  {tab.icon}
                  {tab.label}
                </HStack>
              ),
            }))}
          />
        </Box>

        <Outlet />
      </Stack>
    </Page>
  );
}
