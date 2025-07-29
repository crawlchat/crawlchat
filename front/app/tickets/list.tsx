import {
  TbChevronLeft,
  TbChevronRight,
  TbCopy,
  TbSettings,
  TbTicket,
} from "react-icons/tb";
import { Page } from "~/components/page";
import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/list";
import { prisma } from "libs/prisma";
import type { Thread, Prisma, TicketStatus } from "libs/prisma";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import {
  Badge,
  Box,
  EmptyState,
  Flex,
  Group,
  IconButton,
  Link,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import moment from "moment";
import { Button } from "~/components/ui/button";
import { redirect } from "react-router";
import { Link as RouterLink } from "react-router";
import { useMemo } from "react";
import { toaster } from "~/components/ui/toaster";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
    },
  });

  if (!scrape) {
    throw redirect("/app");
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const status = url.searchParams.get("status") ?? "open";
  const limit = 10;

  const where: Prisma.ThreadWhereInput = {
    scrapeId,
    ticketKey: {
      isSet: true,
    },
  };

  if (status !== "all") {
    where.ticketStatus = status as TicketStatus;
  }

  const threads = await prisma.thread.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  const closed = await prisma.thread.count({
    where: {
      ...where,
      ticketStatus: "closed",
    },
  });

  const open = await prisma.thread.count({
    where: {
      ...where,
      ticketStatus: "open",
    },
  });

  const total = open + closed;
  const currentTotal = status ? (status === "open" ? open : closed) : total;

  const hasNext = page * limit < currentTotal;
  const hasPrevious = page > 1;

  return { threads, total, closed, open, hasNext, hasPrevious, status, page };
}

function Ticket({ thread }: { thread: Thread }) {
  const customTags = useMemo(() => {
    if (!thread.customTags) {
      return [];
    }
    const tags = thread.customTags as Record<string, any>;
    return Object.keys(tags).map((key) => {
      let link = undefined;
      if (key === "store") {
        link = `https://${tags[key]}`;
      } else if (key === "email") {
        link = `mailto:${tags[key]}`;
      } else if (key === "phone") {
        link = `tel:${tags[key]}`;
      }
      return {
        key,
        value: tags[key],
        link,
      };
    });
  }, [thread.customTags]);

  function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
    toaster.success({
      title: "Copied to clipboard",
    });
  }

  return (
    <Stack
      borderBottom={"1px solid"}
      borderColor={"brand.outline"}
      p={4}
      gap={1}
      _last={{
        borderBottom: "none",
      }}
    >
      <Text fontWeight={"medium"}>
        <Link
          target="_blank"
          href={`/ticket/${thread.ticketNumber}`}
          outline={"none"}
        >
          {thread.title}
        </Link>
      </Text>
      <Text fontSize={"sm"} opacity={0.5}>
        {thread.ticketUserEmail}
      </Text>
      <Group>
        <Badge
          colorPalette={thread.ticketStatus === "open" ? "green" : "red"}
          variant={"surface"}
        >
          {thread.ticketStatus?.toUpperCase()}
        </Badge>
        <Text fontSize={"sm"} opacity={0.5}>
          #{thread.ticketNumber}
        </Text>
        <Text fontSize={"sm"} opacity={0.5}>
          {moment(thread.lastMessageAt).format("MMM D, YYYY h:mm A")}
        </Text>
      </Group>
      <Stack gap={0}>
        {thread.customTags &&
          customTags.map((tag) => (
            <Flex
              key={tag.key}
              fontSize={"sm"}
              _hover={{ opacity: 1 }}
              alignItems={"center"}
              gap={2}
            >
              {tag.key}:{" "}
              <Link
                href={tag.link}
                target="_blank"
                rel="noopener noreferrer"
                textDecor={!tag.link ? "none" : undefined}
                cursor={!tag.link ? "default" : "pointer"}
              >
                {tag.value}
              </Link>
              <Box
                opacity={0.5}
                _hover={{ opacity: 1 }}
                cursor={"pointer"}
                onClick={() => copyToClipboard(tag.value)}
              >
                <TbCopy />
              </Box>
            </Flex>
          ))}
      </Stack>
    </Stack>
  );
}

function StatusButton({
  status,
  count,
  active,
  label,
}: {
  status: TicketStatus | "all";
  count: number;
  active: boolean;
  label: string;
}) {
  return (
    <Button variant={active ? "subtle" : "ghost"} asChild>
      <RouterLink to={`/tickets?status=${status}`}>
        {label}
        <Badge variant={"surface"}>{count}</Badge>
      </RouterLink>
    </Button>
  );
}

function NoTickets() {
  return (
    <Stack>
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <TbTicket />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No tickets found</EmptyState.Title>
            <EmptyState.Description>
              Hope your customers are enjoying without any need for support.
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    </Stack>
  );
}

export default function Tickets({ loaderData }: Route.ComponentProps) {
  function getUrl(next: { status?: string; page?: number }) {
    const status = next.status ?? loaderData.status;
    const page = next.page ?? loaderData.page;
    return `/tickets?status=${status}&page=${page}`;
  }

  return (
    <Page
      title="Tickets"
      icon={<TbTicket />}
      right={
        <IconButton variant={"subtle"} asChild>
          <RouterLink to={"/tickets/settings"}>
            <TbSettings />
          </RouterLink>
        </IconButton>
      }
    >
      <Stack>
        <Group justifyContent={"space-between"}>
          <Group />
          <Group>
            <StatusButton
              status="all"
              count={loaderData.total}
              active={loaderData.status === "all"}
              label="All"
            />
            <StatusButton
              status="closed"
              count={loaderData.closed}
              active={loaderData.status === "closed"}
              label="Closed"
            />
            <StatusButton
              status="open"
              count={loaderData.open}
              active={loaderData.status === "open"}
              label="Open"
            />
          </Group>
        </Group>
        {loaderData.threads.length === 0 ? (
          <NoTickets />
        ) : (
          <Stack
            gap={0}
            border={"1px solid"}
            borderColor={"brand.outline"}
            rounded={"md"}
            w={"full"}
          >
            {loaderData.threads.map((thread) => (
              <Ticket key={thread.id} thread={thread} />
            ))}
          </Stack>
        )}

        <Group justifyContent={"space-between"}>
          <Group />
          <Group>
            {loaderData.hasPrevious && (
              <Button variant={"subtle"} asChild>
                <RouterLink to={getUrl({ page: loaderData.page - 1 })}>
                  <TbChevronLeft />
                  Older
                </RouterLink>
              </Button>
            )}
            {loaderData.hasNext && (
              <Button variant={"subtle"} asChild>
                <RouterLink to={getUrl({ page: loaderData.page + 1 })}>
                  Newer
                  <TbChevronRight />
                </RouterLink>
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </Page>
  );
}
