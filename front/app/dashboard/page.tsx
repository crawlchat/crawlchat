import {
  Group,
  Stack,
  HStack,
  Icon,
  Stat,
  Heading,
  Text,
  DialogHeader,
  Input,
  DialogCloseTrigger,
  Center,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import type { Route } from "./+types/page";
import {
  TbCheck,
  TbDatabase,
  TbHelp,
  TbHome,
  TbMessage,
  TbPlus,
  TbStack,
} from "react-icons/tb";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import { Page } from "~/components/page";
import {
  XAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Bar,
  BarChart,
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";
import { numberToKMB } from "~/number-util";
import { commitSession } from "~/session";
import { getSession } from "~/session";
import { redirect, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogRoot,
  DialogTitle,
} from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { EmptyState } from "~/components/ui/empty-state";
import { Tooltip as ChakraTooltip } from "~/components/ui/tooltip";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const session = await getSession(request.headers.get("cookie"));
  let scrapeId = session.get("scrapeId");

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
      scrapeId,
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

  // Check and set the scrapeId
  if (scrapeId) {
    const scrape = await prisma.scrape.findUnique({
      where: { id: scrapeId, userId: user!.id },
    });
    if (!scrape) {
      if (scrapes.length > 0) {
        session.set("scrapeId", scrapes[0].id);
      } else {
        session.unset("scrapeId");
      }
      throw redirect("/app", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }
  if (!scrapeId && scrapes.length > 0) {
    session.set("scrapeId", scrapes[0].id);
    throw redirect("/app", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const scoreDestribution: Record<number, { count: number }> = {};
  const points = 50;
  for (let i = 0; i < points; i++) {
    scoreDestribution[i] = { count: 0 };
  }

  for (const message of messages) {
    if (!message.links || message.links.length === 0) continue;

    const max = Math.max(...message.links.map((l) => l.score ?? 0));
    const index = Math.floor(max * points);
    scoreDestribution[index] = {
      count: (scoreDestribution[index]?.count ?? 0) + 1,
    };
  }

  return {
    user,
    scrapes,
    itemsCount,
    dailyMessages,
    messagesToday,
    scrapeId,
    scoreDestribution,
    scrape: scrapes.find((s) => s.id === scrapeId),
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
  } else if (intent === "create-collection") {
    const name = formData.get("name");
    const scrape = await prisma.scrape.create({
      data: {
        title: name as string,
        userId: user!.id,
        status: "done",
        indexer: "mars",
      },
    });
    const session = await getSession(request.headers.get("cookie"));
    session.set("scrapeId", scrape.id);

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
  const newCollectionFetcher = useFetcher();
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
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

  const scoreDistributionData = useMemo(() => {
    const data = [];
    const points = Object.keys(loaderData.scoreDestribution).length;
    for (let i = 0; i < points; i++) {
      data.push({
        name: i,
        Messages: loaderData.scoreDestribution[i]?.count ?? 0,
        score: i / points,
      });
    }
    return data;
  }, [loaderData.scoreDestribution]);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth);
    }
  }, [containerRef, loaderData.scrapes]);

  useEffect(() => {
    if (loaderData.scrapes.length > 0) {
      setNewCollectionDialogOpen(false);
    }
  }, [loaderData.scrapes]);

  return (
    <Page
      title="Home"
      icon={<TbHome />}
      right={
        <Group>
          <Button
            variant={"subtle"}
            onClick={() => setNewCollectionDialogOpen(true)}
          >
            <TbPlus />
            New collection
          </Button>
          <Button variant={"subtle"} colorPalette={"brand"} asChild>
            <a href={`/w/${loaderData.scrapeId}`} target="_blank">
              <TbMessage />
              Chat
            </a>
          </Button>
        </Group>
      }
    >
      {loaderData.scrapes.length === 0 && (
        <Center w="full" h="full">
          <EmptyState
            icon={<TbDatabase />}
            title="No collections"
            description="Create a new collection to get started"
          >
            <Button
              colorPalette={"brand"}
              onClick={() => setNewCollectionDialogOpen(true)}
            >
              <TbPlus />
              New collection
            </Button>
          </EmptyState>
        </Center>
      )}

      {loaderData.scrapes.length > 0 && (
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
                <ChakraTooltip
                  showArrow
                  content={
                    "Shows the number of messages in conversations in the last 7 days across all the channels"
                  }
                >
                  <Icon opacity={0.5}>
                    <TbHelp />
                  </Icon>
                </ChakraTooltip>
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

          <Stack>
            <Heading>
              <Group>
                <TbMessage />
                <Text>Score distribution</Text>
                <ChakraTooltip
                  showArrow
                  content={
                    "Shows how the score of each message from AI is distributed from 0 to 1. 0 is worst and 1 is best."
                  }
                >
                  <Icon opacity={0.5}>
                    <TbHelp />
                  </Icon>
                </ChakraTooltip>
              </Group>
            </Heading>
            <BarChart
              width={width - 10}
              height={200}
              data={scoreDistributionData}
            >
              <XAxis dataKey="score" />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar
                type="monotone"
                dataKey="Messages"
                fill={"var(--chakra-colors-brand-emphasized)"}
              />
            </BarChart>
          </Stack>

          {loaderData.scrape && loaderData.scrape.analytics?.categories && (
            <Stack>
              <Heading>
                <Group>
                  <TbStack />
                  <Text>Message categories</Text>
                  <ChakraTooltip
                    showArrow
                    content={
                      "These are the categories of the messages received in the last 7 days across all the channels"
                    }
                  >
                    <Icon opacity={0.5}>
                      <TbHelp />
                    </Icon>
                  </ChakraTooltip>
                  <Text fontSize={"sm"} opacity={0.2}>
                    Updated once a day
                  </Text>
                </Group>
              </Heading>

              <SimpleGrid columns={[1, 2, 3]} gap={4}>
                {loaderData.scrape.analytics.categories
                  .sort((a, b) => b.messageIds.length - a.messageIds.length)
                  .map((c) => (
                    <Group
                      key={c.key}
                      border="1px solid"
                      borderColor={"brand.outline"}
                      p={4}
                      rounded={"lg"}
                      justifyContent={"space-between"}
                    >
                      <Stack gap={1}>
                        <Text fontWeight={"bold"}>{c.name}</Text>
                        <Text fontSize={"sm"} opacity={0.4}>
                          {c.description}
                        </Text>
                      </Stack>
                      <Group>
                        <Center
                          w={10}
                          h={10}
                          rounded={"full"}
                          bg={"brand.subtle"}
                          color={"brand.fg"}
                          fontWeight={"bold"}
                          border={"1px solid"}
                          borderColor={"brand.outline"}
                        >
                          <Text>{c.messageIds.length}</Text>
                        </Center>
                      </Group>
                    </Group>
                  ))}
              </SimpleGrid>
            </Stack>
          )}
        </Stack>
      )}

      <DialogRoot
        open={newCollectionDialogOpen}
        onOpenChange={(e) => setNewCollectionDialogOpen(e.open)}
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Group>
                <TbPlus />
                <Text>New collection</Text>
              </Group>
            </DialogTitle>
          </DialogHeader>
          <newCollectionFetcher.Form method="post">
            <DialogBody>
              <input type="hidden" name="intent" value="create-collection" />
              <Field label="Give it a name">
                <Input name="name" placeholder="Collection name" required />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Group>
                <DialogCloseTrigger
                  asChild
                  disabled={newCollectionFetcher.state !== "idle"}
                >
                  <Button variant={"outline"}>Cancel</Button>
                </DialogCloseTrigger>
                <Button
                  type="submit"
                  colorPalette={"brand"}
                  disabled={newCollectionFetcher.state !== "idle"}
                >
                  Create
                  <TbCheck />
                </Button>
              </Group>
            </DialogFooter>
          </newCollectionFetcher.Form>
        </DialogContent>
      </DialogRoot>
    </Page>
  );
}
