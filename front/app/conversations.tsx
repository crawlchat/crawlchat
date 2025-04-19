import {
  Badge,
  Center,
  EmptyState,
  Flex,
  Group,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Page } from "./components/page";
import { TbMessages } from "react-icons/tb";
import type { Route } from "./+types/conversations";
import { getAuthUser } from "./auth/middleware";
import { getSessionScrapeId } from "./scrapes/util";
import type { Prisma } from "libs/prisma";
import { prisma } from "libs/prisma";
import moment from "moment";
import { useState } from "react";
import ChatBox from "./dashboard/chat-box";

type ThreadWithMessages = Prisma.ThreadGetPayload<{
  include: {
    messages: true;
  };
}>;

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      ownerUserId: user!.id,
      scrapeId,
      createdAt: {
        gte: ONE_WEEK_AGO,
      },
    },
    include: {
      thread: {
        include: {
          messages: true,
        },
      },
    },
  });

  const threads: Record<string, ThreadWithMessages> = {};

  for (const message of messages) {
    if (!threads[message.threadId]) {
      threads[message.threadId] = message.thread;
    }
  }

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
    },
  });

  return {
    threads: Object.values(threads)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .filter((thread) => !thread.isDefault),
    scrape,
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
            {loaderData.threads.map((thread) => (
              <Stack
                key={thread.id}
                borderBottom={"1px solid"}
                borderColor="brand.outline"
                px={4}
                py={2}
                gap={1}
                cursor={"pointer"}
                bg={
                  selectedThread?.id === thread.id ? "brand.gray.50" : undefined
                }
                _hover={{ bg: "brand.gray.50" }}
                _first={{
                  borderTop: "1px solid",
                  borderColor: "brand.outline",
                }}
                onClick={() => setSelectedThread(thread)}
              >
                <Group justifyContent={"space-between"}>
                  <Group>
                    <TbMessages />
                    <Text opacity={0.8}>
                      {thread.id.substring(thread.id.length - 4)}
                    </Text>
                  </Group>
                  <Badge colorPalette={"brand"} variant={"surface"}>
                    {thread.messages.length}
                  </Badge>
                </Group>
                <Text opacity={0.5} fontSize={"sm"}>
                  {moment(thread.createdAt).fromNow()}
                </Text>
              </Stack>
            ))}
          </Stack>
          <Stack h="full" flex={1} bg="brand.gray.100">
            <Center h="full" w="full">
              {selectedThread && (
                <ChatBox
                  thread={selectedThread}
                  scrape={loaderData.scrape!}
                  userToken={"NA"}
                  key={selectedThread!.id}
                  onBgClick={() => {}}
                  onPin={() => {}}
                  onUnpin={() => {}}
                  onErase={() => {}}
                  onDelete={() => {}}
                  messages={selectedThread.messages}
                  showScore
                />
              )}
            </Center>
          </Stack>
        </Flex>
      )}
    </Page>
  );
}
