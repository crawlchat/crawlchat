import { prisma } from "libs/prisma";
import type { Scrape, TicketAuthorRole } from "libs/prisma";
import type { Route } from "./+types/ticket";
import {
  Badge,
  Group,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { TbAlertCircle, TbCheck, TbMessage, TbUser } from "react-icons/tb";
import { RiChatVoiceAiFill } from "react-icons/ri";
import { useMemo } from "react";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import moment from "moment";
import { getAuthUser } from "~/auth/middleware";

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const ticketNumber = parseInt(params.number);

  const thread = await prisma.thread.findFirst({
    where: {
      ticketNumber,
      ticketKey: key,
    },
    include: {
      messages: true,
      scrape: true,
    },
  });
  return { thread, passedKey: key, ticketNumber };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: "CrawlChat",
    },
  ];
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const key = formData.get("key") as string;

  const thread = await prisma.thread.findFirst({
    where: {
      ticketNumber: parseInt(params.number),
      ticketKey: key,
    },
    include: {
      scrape: true,
    },
  });

  if (!thread) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  const loggedInUser = await getAuthUser(request, { dontRedirect: true });

  if (intent === "comment") {
    const content = formData.get("content") as string;
    const role = loggedInUser?.id === thread.scrape.userId ? "agent" : "user";
    const message = await prisma.message.create({
      data: {
        ownerUserId: thread.scrape.userId,
        threadId: thread.id,
        scrapeId: thread.scrape.id,
        llmMessage: {
          role: "user",
          content,
        },
        ticketMessage: {
          role,
          event: "message",
        },
      },
    });

    return { message };
  }
}

function Nav({ scrape }: { scrape: Scrape }) {
  return (
    <Stack as="nav">
      <Group justifyContent={"space-between"}>
        <Group>
          {scrape.logoUrl && (
            <Image
              src={scrape.logoUrl}
              alt={scrape.title ?? ""}
              maxH={"18px"}
            />
          )}
          <Text fontSize={"lg"} fontWeight={"bold"}>
            {scrape.title}
          </Text>
        </Group>
        <Text
          fontSize={"sm"}
          opacity={0.5}
          display={"flex"}
          alignItems={"center"}
          gap={2}
        >
          Powered by{" "}
          <Link href="https://crawlchat.com" fontWeight={"bold"}>
            <RiChatVoiceAiFill />
            CrawlChat
          </Link>
        </Text>
      </Group>
    </Stack>
  );
}

type TicketMessage = {
  id: string;
  role: TicketAuthorRole;
  content: string;
  createdAt: Date;
};

function Message({
  scrape,
  message,
}: {
  scrape: Scrape;
  message: TicketMessage;
}) {
  return (
    <Stack
      border={"1px solid"}
      borderColor={"brand.outline"}
      rounded={"md"}
      gap={0}
    >
      <Group
        px={4}
        py={2}
        borderBottom={"1px solid"}
        borderColor={"brand.outline"}
        bg="brand.gray"
      >
        {message.role === "agent" && (
          <Image
            src={scrape.logoUrl ?? "/logo.png"}
            alt={scrape.title ?? ""}
            maxH={"18px"}
          />
        )}
        {message.role === "user" && <TbUser />}
        <Text fontWeight={"bold"}>
          {message.role === "user" ? "You" : scrape.title}
        </Text>
        <Text opacity={0.5} fontSize={"sm"}>
          {moment(message.createdAt).fromNow()}
        </Text>
      </Group>
      <Stack p={4}>
        <Text>{message.content}</Text>
      </Stack>
    </Stack>
  );
}

export default function Ticket({ loaderData }: Route.ComponentProps) {
  const commentFetcher = useFetcher();

  const ticketMessages = useMemo<TicketMessage[]>(() => {
    if (!loaderData.thread) return [];
    return loaderData.thread.messages
      .filter((message) => message.ticketMessage)
      .map((message) => ({
        id: message.id,
        role: message.ticketMessage!.role,
        content: (message.llmMessage as any).content,
        createdAt: message.createdAt,
      }));
  }, [loaderData.thread]);

  const openedAt = useMemo(() => {
    if (ticketMessages.length === 0) return null;
    return ticketMessages[0].createdAt;
  }, [ticketMessages]);

  if (!loaderData.thread) {
    return (
      <Stack alignItems={"center"} justifyContent={"center"} h="100vh" w="full">
        <TbAlertCircle size={48} />
        <Text>Ticket not found</Text>
      </Stack>
    );
  }
  return (
    <Stack alignItems={"center"}>
      <Stack maxW={800} w="full" gap={8} p={4}>
        <Nav scrape={loaderData.thread.scrape} />
        {loaderData.thread.title && (
          <Stack>
            <Heading size={"2xl"} as="h1">
              <Text as="span" opacity={0.2}>
                #{loaderData.thread.ticketNumber}
              </Text>{" "}
              {loaderData.thread.title}
            </Heading>
            <Group>
              <Badge
                colorPalette={
                  loaderData.thread.ticketStatus === "open"
                    ? "green"
                    : undefined
                }
                variant={"surface"}
              >
                {loaderData.thread.ticketStatus!.toUpperCase()}
              </Badge>
              <Text opacity={0.5}>Opened {moment(openedAt).fromNow()}</Text>
            </Group>
          </Stack>
        )}
        <Stack gap={4}>
          {ticketMessages.map((message, idx) => (
            <Message
              key={message.id}
              message={message}
              scrape={loaderData.thread!.scrape}
            />
          ))}
        </Stack>
        <commentFetcher.Form method="post">
          <Stack>
            <input type="hidden" name="intent" value={"comment"} />
            <input
              type="hidden"
              name="key"
              value={loaderData.passedKey ?? ""}
            />
            <Text fontWeight={"medium"}>Add a message</Text>
            <Textarea
              name="content"
              placeholder="Type your message here..."
              rows={3}
              required
            />
            <Group justifyContent={"flex-end"}>
              <Button
                type="submit"
                loading={commentFetcher.state !== "idle"}
                variant={"subtle"}
              >
                Resolve & Close
                <TbCheck />
              </Button>
              <Button type="submit" loading={commentFetcher.state !== "idle"}>
                Comment
                <TbMessage />
              </Button>
            </Group>
          </Stack>
        </commentFetcher.Form>
      </Stack>
    </Stack>
  );
}
