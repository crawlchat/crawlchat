import { Center, Flex, Group, Stack, Text } from "@chakra-ui/react";
import { TbSettingsBolt } from "react-icons/tb";
import { Page } from "~/components/page";
import ChatBox from "~/dashboard/chat-box";
import type { Route } from "./+types/fix";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { getSessionScrapeId } from "~/scrapes/util";
import { redirect } from "react-router";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
      userId: user!.id,
    },
  });

  if (!scrape) {
    throw redirect("/dashboard");
  }

  const message = await prisma.message.findUnique({
    where: {
      id: params.messageId,
    },
  });

  if (!message) {
    throw redirect("/dashboard");
  }

  const thread = await prisma.thread.findUnique({
    where: {
      id: message.threadId,
    },
    include: {
      messages: true,
    },
  });

  if (!thread) {
    throw redirect("/dashboard");
  }

  return {
    scrape,
    message,
    thread,
  };
}

export default function FixMessage({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Fix message" icon={<TbSettingsBolt />} noPadding>
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
        </Stack>
        <Stack h="full" flex={1} bg="brand.gray.100">
          <Center h="full" w="full">
            <ChatBox
              thread={loaderData.thread}
              scrape={loaderData.scrape}
              userToken={"NA"}
              key={loaderData.thread.id}
              onBgClick={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
              onErase={() => {}}
              onDelete={() => {}}
              onRate={() => {}}
              messages={loaderData.thread.messages}
              showScore
            />
          </Center>
        </Stack>
      </Flex>
    </Page>
  );
}
