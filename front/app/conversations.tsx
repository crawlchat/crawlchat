import {
  Badge,
  Box,
  Center,
  EmptyState,
  Flex,
  Group,
  IconButton,
  Image,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Page } from "./components/page";
import {
  TbChevronLeft,
  TbChevronRight,
  TbMessage,
  TbMessages,
  TbTicket,
} from "react-icons/tb";
import type { Route } from "./+types/conversations";
import { getAuthUser } from "./auth/middleware";
import { getSessionScrapeId } from "./scrapes/util";
import type { Prisma } from "libs/prisma";
import { prisma } from "libs/prisma";
import moment from "moment";
import { useState } from "react";
import ChatBox from "./dashboard/chat-box";
import { getMessagesScore, getScoreColor } from "./score";
import { Tooltip } from "./components/ui/tooltip";
import { Link, redirect } from "react-router";

type ThreadWithMessages = Prisma.ThreadGetPayload<{
  include: {
    messages: true;
  };
}>;

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: {
      userId: user!.id,
      id: scrapeId,
    },
  });

  if (!scrape) {
    throw redirect("/dashboard");
  }

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 10;

  const where: Prisma.ThreadWhereInput = {
    scrapeId,
    lastMessageAt: {
      gte: ONE_WEEK_AGO,
    },
    OR: [
      {
        isDefault: false,
      },
      {
        isDefault: {
          isSet: false,
        },
      },
    ],
  };

  const totalThreads = await prisma.thread.count({
    where,
  });

  const totalPages = Math.ceil(totalThreads / pageSize);

  const threads = await prisma.thread.findMany({
    where,
    include: {
      messages: true,
    },
    orderBy: {
      lastMessageAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    threads,
    scrape,
    totalThreads,
    totalPages,
    page,
    from: (page - 1) * pageSize + 1,
    to: (page - 1) * pageSize + pageSize,
  };
}

export default function Conversations({ loaderData }: Route.ComponentProps) {
  const [selectedThread, setSelectedThread] = useState<
    ThreadWithMessages | undefined
  >(loaderData.threads[0]);

  return (
    <Page title="Conversations" icon={<TbMessages />} noPadding>
      {loaderData.threads.length === 0 && (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <TbMessages />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>No conversations found</EmptyState.Title>
              <EmptyState.Description>
                Integrate the collection on your website to start making
                conversations
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      )}
      {loaderData.threads.length > 0 && (
        <Flex h="full">
          <Stack
            maxW="300px"
            w="full"
            borderRight={"1px solid"}
            borderColor="brand.outline"
            h="full"
            maxH={"calc(100dvh - 60px)"}
            gap={0}
            overflowY={"auto"}
          >
            <Text p={4} opacity={0.5}>
              Here are the conversations made by your customers or community on
              your website
            </Text>

            <Group p={4}>
              <IconButton
                size={"sm"}
                variant={"subtle"}
                disabled={loaderData.page === 1}
              >
                <Link
                  to={
                    loaderData.page > 1
                      ? `/conversations?page=${loaderData.page - 1}`
                      : "#"
                  }
                >
                  <TbChevronLeft />
                </Link>
              </IconButton>
              <Group flex={1} justifyContent={"center"} gap={4} fontSize={"sm"}>
                <Text>
                  {loaderData.from} - {loaderData.to}
                </Text>
                <Text>
                  {loaderData.page} / {loaderData.totalPages}
                </Text>
              </Group>
              <IconButton
                size={"sm"}
                variant={"subtle"}
                disabled={loaderData.page === loaderData.totalPages}
              >
                <Link
                  to={
                    loaderData.page < loaderData.totalPages
                      ? `/conversations?page=${loaderData.page + 1}`
                      : "#"
                  }
                >
                  <TbChevronRight />
                </Link>
              </IconButton>
            </Group>

            {loaderData.threads.map((thread) => (
              <Stack
                key={thread.id}
                borderTop={"1px solid"}
                borderColor="brand.outline"
                px={4}
                py={2}
                gap={1}
                cursor={"pointer"}
                bg={
                  selectedThread?.id === thread.id ? "brand.gray.50" : undefined
                }
                _hover={{ bg: "brand.gray.50" }}
                _last={{
                  borderBottom: "1px solid",
                  borderColor: "brand.outline",
                }}
                onClick={() => setSelectedThread(thread)}
              >
                <Group justifyContent={"space-between"}>
                  <Group>
                    {thread.location?.country && (
                      <Tooltip
                        content={[
                          thread.location.city,
                          thread.location.region,
                          thread.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                        positioning={{ placement: "top" }}
                        showArrow
                      >
                        <Image
                          src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${thread.location.country.toUpperCase()}.svg`}
                          alt={thread.location?.country}
                          h={3}
                          aspectRatio={"3/2"}
                        />
                      </Tooltip>
                    )}
                    <Text opacity={0.8}>
                      {thread.id.substring(thread.id.length - 4)}
                    </Text>
                  </Group>
                  <Group>
                    {thread.ticketStatus && (
                      <Tooltip content="Ticket created" showArrow>
                        <Badge colorPalette={"brand"} variant={"surface"}>
                          <TbTicket />
                        </Badge>
                      </Tooltip>
                    )}
                    <Tooltip content="Avg score of all the messages" showArrow>
                      <Badge
                        colorPalette={getScoreColor(
                          getMessagesScore(thread.messages)
                        )}
                        variant={"surface"}
                      >
                        {getMessagesScore(thread.messages).toFixed(2)}
                      </Badge>
                    </Tooltip>
                    <Badge colorPalette={"brand"} variant={"surface"}>
                      <TbMessage />
                      {thread.messages.length}
                    </Badge>
                  </Group>
                </Group>
                <Text opacity={0.5} fontSize={"sm"}>
                  {moment(thread.createdAt).fromNow()}
                </Text>
                <Stack gap={0.2}>
                  {thread.customTags &&
                    Object.keys(thread.customTags).map((key) => (
                      <Box key={key}>
                        <Badge variant={"surface"}>
                          {key}:{" "}
                          {(thread.customTags as Record<string, any>)[key]}
                        </Badge>
                      </Box>
                    ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
          <Stack h="full" flex={1} bg="brand.gray.100">
            <Center h="full" w="full">
              {selectedThread && (
                <ChatBox
                  scrape={loaderData.scrape!}
                  key={selectedThread!.id}
                  messages={selectedThread.messages}
                  showScore
                  ticketNumber={selectedThread.ticketNumber ?? undefined}
                />
              )}
            </Center>
          </Stack>
        </Flex>
      )}
    </Page>
  );
}
