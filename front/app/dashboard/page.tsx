import {
  Group,
  Stack,
  HStack,
  Icon,
  Stat,
  Heading,
  Text,
} from "@chakra-ui/react";
import type { Route } from "./+types/page";
import { TbHelp, TbHome, TbMessage } from "react-icons/tb";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import { Page } from "~/components/page";
import { XAxis, CartesianGrid, Tooltip, AreaChart, Area } from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { numberToKMB } from "~/number-util";
import { commitSession } from "~/session";
import { getSession } from "~/session";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapes = await prisma.scrape.findMany({
    where: {
      userId: user?.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const itemsCount: Record<string, number> = {};
  for (const scrape of scrapes) {
    itemsCount[scrape.id] = await prisma.scrapeItem.count({
      where: {
        scrapeId: scrape.id,
      },
    });
  }

  const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

  const messages = await prisma.message.findMany({
    where: {
      ownerUserId: user!.id,
      createdAt: {
        gte: new Date(Date.now() - ONE_WEEK),
      },
    },
  });

  const dailyMessages: Record<string, number> = {};

  for (const message of messages) {
    if (!message.createdAt) continue;
    const date = new Date(message.createdAt);
    const key = date.toISOString().split("T")[0];
    dailyMessages[key] = (dailyMessages[key] ?? 0) + 1;
  }

  const today = new Date();
  const todayKey = today.toISOString().split("T")[0];
  const messagesToday = dailyMessages[todayKey] ?? 0;

  return {
    user,
    scrapes,
    itemsCount,
    dailyMessages,
    messagesToday,
  };
}

export function meta() {
  return [
    {
      title: "CrawlChat",
      description: "Chat with any website!",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request, { redirectTo: "/login" });

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "set-scrape-id") {
    const scrapeId = formData.get("scrapeId");
    const session = await getSession(request.headers.get("cookie"));
    session.set("scrapeId", scrapeId as string);

    throw redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Stat.Root flex={1} borderWidth="1px" p="4" rounded="md">
      <HStack justify="space-between">
        <Stat.Label>{label}</Stat.Label>
        <Icon color="fg.muted">{icon}</Icon>
      </HStack>
      <Stat.ValueText>{numberToKMB(value)}</Stat.ValueText>
    </Stat.Root>
  );
}

export default function DashboardPage({ loaderData }: Route.ComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const DAY_MS = 1000 * 60 * 60 * 24;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * DAY_MS);
      const key = date.toISOString().split("T")[0];
      data.push({
        name: key,
        Messages: loaderData.dailyMessages[key] ?? 0,
      });
    }
    return data.reverse();
  }, [loaderData.dailyMessages]);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
    }
  }, [containerRef]);

  return (
    <Page title="Home" icon={<TbHome />}>
      <Stack height={"100%"} gap={8} ref={containerRef}>
        <Group>
          <StatCard
            label="Messages today"
            value={loaderData.messagesToday}
            icon={<TbMessage />}
          />
          <StatCard
            label="Messages this week"
            value={Object.values(loaderData.dailyMessages).reduce(
              (acc, curr) => acc + curr,
              0
            )}
            icon={<TbMessage />}
          />
        </Group>

        <Stack>
          <Heading>
            <Group>
              <TbMessage />
              <Text>Messages</Text>
            </Group>
          </Heading>
          <AreaChart width={width - 10} height={200} data={chartData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="Messages"
              stroke={"var(--chakra-colors-brand-emphasized)"}
              fill={"var(--chakra-colors-brand-muted)"}
            />
          </AreaChart>
        </Stack>
      </Stack>
    </Page>
  );
}
