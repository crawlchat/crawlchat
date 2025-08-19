import { Group, Stack } from "@chakra-ui/react";
import { Outlet, useFetcher } from "react-router";
import type { Route } from "./+types/layout";
import { AppContext, useApp } from "./context";
import { getAuthUser } from "~/auth/middleware";
import { Toaster } from "~/components/ui/toaster";
import { SideMenu } from "./side-menu";
import {
  DrawerBackdrop,
  DrawerContent,
  DrawerRoot,
} from "~/components/ui/drawer";
import { useEffect, useRef } from "react";
import { PLAN_FREE } from "libs/user-plan";
import { planMap } from "libs/user-plan";
import { prisma } from "libs/prisma";
import { getSession } from "~/session";
import { vemetric } from "@vemetric/react";
import { fetchDataGaps } from "~/data-gaps/fetch";

export function meta() {
  return [
    {
      title: "CrawlChat",
    },
    {
      name: "description",
      content:
        "Make AI chatbot from your documentation that handles your support queries. Embed it in your website, Discord, or Slack.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request, { redirectTo: "/login" });

  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");

  const scrapes = await prisma.scrapeUser
    .findMany({
      where: {
        userId: user!.id,
      },
      include: {
        scrape: {
          include: {
            user: true,
          },
        },
      },
    })
    .then((scrapeUsers) => scrapeUsers.map((su) => su.scrape));

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const toBeFixedMessages = await prisma.message.count({
    where: {
      scrapeId,
      createdAt: { gte: ONE_WEEK_AGO },
      rating: "down",
      OR: [{ correctionItemId: { isSet: false } }, { correctionItemId: null }],
    },
  });

  const openTickets = await prisma.thread.count({
    where: {
      scrapeId,
      ticketStatus: "open",
    },
  });

  const scrape = scrapes.find((s) => s.id === scrapeId);
  const plan = scrape?.user.plan?.planId
    ? planMap[scrape.user.plan.planId]
    : PLAN_FREE;

  const dataGapMessages = scrapeId ? await fetchDataGaps(scrapeId) : [];

  return {
    user: user!,
    plan,
    scrapes,
    scrapeId,
    toBeFixedMessages,
    openTickets,
    scrape,
    dataGapMessages,
  };
}

const drawerWidth = 260;

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const app = useApp({ user, scrapeId: loaderData.scrapeId });
  const contentRef = useRef<HTMLDivElement>(null);
  const scrapeIdFetcher = useFetcher();

  useEffect(() => {
    (async () => {
      await vemetric.identify({
        identifier: user.id,
        displayName: user.name ?? "Unnamed",
      });
    })();
  }, []);

  return (
    <AppContext.Provider value={app}>
      <Group align="start" gap={0} w="full" minH="100dvh">
        <SideMenu
          width={drawerWidth}
          loggedInUser={user}
          scrapeOwner={loaderData.scrape?.user!}
          fixed={true}
          plan={loaderData.plan}
          scrapes={loaderData.scrapes}
          scrapeId={loaderData.scrapeId}
          scrapeIdFetcher={scrapeIdFetcher}
          toBeFixedMessages={loaderData.toBeFixedMessages}
          openTickets={loaderData.openTickets}
          scrape={loaderData.scrape}
          dataGapMessages={loaderData.dataGapMessages.length}
        />

        <DrawerRoot
          open={app.menuOpen}
          size={"xs"}
          placement={"start"}
          onOpenChange={(e) => !e.open && app.setMenuOpen(false)}
        >
          <DrawerBackdrop />
          <DrawerContent ref={contentRef}>
            <SideMenu
              width={drawerWidth}
              loggedInUser={user}
              scrapeOwner={loaderData.scrape?.user!}
              fixed={false}
              contentRef={contentRef}
              plan={loaderData.plan}
              scrapes={loaderData.scrapes}
              scrapeId={loaderData.scrapeId}
              scrapeIdFetcher={scrapeIdFetcher}
              toBeFixedMessages={loaderData.toBeFixedMessages}
              openTickets={loaderData.openTickets}
              dataGapMessages={loaderData.dataGapMessages.length}
            />
          </DrawerContent>
        </DrawerRoot>

        <Stack flex={1} alignSelf={"stretch"} ml={[0, 0, drawerWidth]}>
          <Outlet />
        </Stack>
      </Group>
      <Toaster />
    </AppContext.Provider>
  );
}
