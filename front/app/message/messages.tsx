import {
  Group,
  Stack,
  Text,
  Badge,
  EmptyState,
  VStack,
  Link,
  Center,
  Icon,
  Table,
  Drawer,
  Portal,
  IconButton,
  Heading,
  DataList,
} from "@chakra-ui/react";
import {
  TbBox,
  TbBrandDiscord,
  TbBrandSlack,
  TbCopy,
  TbMessage,
  TbPointer,
  TbRobotFace,
  TbSettingsBolt,
  TbThumbDown,
  TbThumbUp,
} from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/messages";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import { MarkdownProse } from "~/widget/markdown-prose";
import moment from "moment";
import { useMemo, useState } from "react";
import { makeMessagePairs, type MessagePair } from "./analyse";
import { Tooltip } from "~/components/ui/tooltip";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import type { ApiAction, Message, MessageChannel } from "libs/prisma";
import { getScoreColor } from "~/score";
import { Link as RouterLink } from "react-router";
import { ViewSwitch } from "./view-switch";
import { CountryFlag } from "./country-flag";
import { extractCitations } from "libs/citation";
import { SingleLineCell } from "~/components/single-line-cell";
import { Button } from "~/components/ui/button";
import { truncate } from "~/util";
import { toaster } from "~/components/ui/toaster";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      createdAt: {
        gte: ONE_WEEK_AGO,
      },
    },
    include: {
      thread: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  let messagePairs = makeMessagePairs(messages);

  const url = new URL(request.url);
  const rating = url.searchParams.get("rating");
  if (rating) {
    messagePairs = messagePairs.filter(
      (pair) => pair.responseMessage.rating === rating
    );
  }

  const queryMessageId = url.searchParams.get("query-message-id");
  let messagePair = null;
  if (queryMessageId) {
    messagePair = messagePairs.find(
      (pair) => pair.queryMessage?.id === queryMessageId
    );
  }

  const actions = await prisma.apiAction.findMany({
    where: {
      scrapeId,
    },
  });
  const actionsMap = new Map<string, ApiAction>(
    actions.map((action) => [action.id, action])
  );

  return { messagePairs, messagePair, actionsMap };
}

function getMessageContent(message?: Message) {
  return (message?.llmMessage as any)?.content ?? "-";
}

function ChannelIcon({ channel }: { channel?: MessageChannel | null }) {
  const [text, icon, color] = useMemo(() => {
    if (channel === "discord") {
      return ["Discord", TbBrandDiscord, "orange"];
    }
    if (channel === "mcp") {
      return ["MCP", TbRobotFace, "blue"];
    }
    if (channel === "slack") {
      return ["Slack", TbBrandSlack, "orange"];
    }
    return ["Chatbot", TbMessage, "brand"];
  }, [channel]);

  return (
    <Badge colorPalette={color} variant={"surface"}>
      <Icon as={icon} />
      {text}
    </Badge>
  );
}

function AssistantMessage({
  message,
  actionsMap,
}: {
  message: Message;
  actionsMap: Map<string, ApiAction>;
}) {
  const [hoveredUniqueId, setHoveredUniqueId] = useState<string | null>(null);
  const citation = useMemo(
    () => extractCitations(getMessageContent(message), message.links),
    [message]
  );

  return (
    <>
      <MarkdownProse
        sources={Object.values(citation.citedLinks).map((link) => ({
          title: link?.title ?? link?.url ?? "Source",
          url: link?.url ?? undefined,
        }))}
        options={{
          disabled: true,
          onSourceMouseEnter: (index) => {
            for (let i = 0; i < Object.keys(citation.citedLinks).length; i++) {
              if (
                citation.citedLinks[i].fetchUniqueId ===
                message.links[index].fetchUniqueId
              ) {
                setHoveredUniqueId(message.links[index].fetchUniqueId);
                break;
              }
            }
          },
          onSourceMouseLeave: () => setHoveredUniqueId(null),
        }}
      >
        {citation.content}
      </MarkdownProse>

      {message.links.length > 0 && (
        <Stack>
          <Heading>Knowledge queries</Heading>
          <Table.Root variant={"outline"}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Knowledge Item</Table.ColumnHeader>
                <Table.ColumnHeader>Query</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Score</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body background={"brand.white"}>
              {message.links.map((link, index) => (
                <Table.Row
                  key={index}
                  bg={
                    hoveredUniqueId === link.fetchUniqueId
                      ? "brand.gray.100"
                      : "brand.white"
                  }
                >
                  <Table.Cell>
                    <Group>
                      <Link
                        href={`/knowledge/item/${link.scrapeItemId}`}
                        target="_blank"
                      >
                        {link.title || link.url}
                      </Link>
                    </Group>
                  </Table.Cell>
                  <Table.Cell>{link.searchQuery ?? "-"}</Table.Cell>
                  <Table.Cell textAlign="end">
                    <Badge
                      colorPalette={getScoreColor(link.score ?? 0)}
                      variant={"surface"}
                    >
                      {link.score?.toFixed(2)}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Stack>
      )}

      {message.apiActionCalls.length > 0 && (
        <Stack>
          <Heading>Actions</Heading>
          {message.apiActionCalls.map((call) => (
            <Stack
              border={"1px solid"}
              borderColor={"brand.outline"}
              p={4}
              rounded={"md"}
            >
              <DataList.Root>
                <DataList.Item>
                  <DataList.ItemLabel>Title</DataList.ItemLabel>
                  <DataList.ItemValue>
                    {actionsMap.get(call.actionId)?.title}
                  </DataList.ItemValue>
                </DataList.Item>

                <DataList.Item>
                  <DataList.ItemLabel>Status code</DataList.ItemLabel>
                  <DataList.ItemValue>
                    {call.statusCode}
                  </DataList.ItemValue>
                </DataList.Item>

                <DataList.Item>
                  <DataList.ItemLabel>Input</DataList.ItemLabel>
                  <DataList.ItemValue>
                    {JSON.stringify(call.data)}
                  </DataList.ItemValue>
                </DataList.Item>

                <DataList.Item>
                  <DataList.ItemLabel>Output</DataList.ItemLabel>
                  <DataList.ItemValue>
                    {call.response as string}
                  </DataList.ItemValue>
                </DataList.Item>
              </DataList.Root>
            </Stack>
          ))}
        </Stack>
      )}
    </>
  );
}

function MessageDrawer({
  messagePair,
  actionsMap,
}: {
  messagePair?: MessagePair | null;
  actionsMap: Map<string, ApiAction>;
}) {
  function copyMessage() {
    navigator.clipboard.writeText(
      (messagePair?.queryMessage?.llmMessage as any)?.content ?? ""
    );
    toaster.success({
      title: "Copied to clipboard",
    });
  }

  return (
    <Drawer.Root open={!!messagePair} size={"lg"}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>
                {truncate(
                  (messagePair?.queryMessage?.llmMessage as any)?.content ?? "",
                  500
                )}
              </Drawer.Title>
              <Group mt={2} justifyContent={"space-between"} w="full">
                <Group>
                  <ChannelIcon channel={messagePair?.queryMessage?.channel} />
                  {messagePair?.responseMessage.rating && (
                    <Rating rating={messagePair?.responseMessage.rating} />
                  )}
                  {messagePair?.queryMessage?.thread.location && (
                    <CountryFlag
                      location={messagePair?.queryMessage?.thread.location}
                    />
                  )}
                  <Text>
                    {moment(messagePair?.queryMessage?.createdAt).fromNow()}
                  </Text>
                </Group>

                <Group>
                  <IconButton
                    variant={"subtle"}
                    size={"xs"}
                    onClick={copyMessage}
                  >
                    <TbCopy />
                  </IconButton>
                </Group>
              </Group>
            </Drawer.Header>
            <Drawer.Body>
              {messagePair && (
                <AssistantMessage
                  message={messagePair.responseMessage}
                  actionsMap={actionsMap}
                />
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline" asChild>
                <RouterLink to={`/messages`} replace>
                  Close
                </RouterLink>
              </Button>
              <Button asChild>
                <RouterLink
                  to={`/messages/${messagePair?.responseMessage?.id}/fix`}
                >
                  <TbSettingsBolt />
                  Correct it
                  {messagePair?.responseMessage.correctionItemId && " again"}
                </RouterLink>
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}

function Rating({ rating }: { rating: Message["rating"] }) {
  if (!rating) return null;

  return (
    <Tooltip content="Rating from the user" showArrow>
      <Badge
        colorPalette={rating === "up" ? "green" : "red"}
        variant={"surface"}
      >
        {rating === "up" ? <TbThumbUp /> : <TbThumbDown />}
      </Badge>
    </Tooltip>
  );
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Messages" icon={<TbMessage />} right={<ViewSwitch />}>
      <Stack>
        {loaderData.messagePairs.length === 0 && (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <TbMessage />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No messages yet!</EmptyState.Title>
                <EmptyState.Description maxW={"lg"}>
                  Embed the chatbot, use MCP server or the Discord Bot to let
                  your customers talk with your documentation.
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        )}
        {loaderData.messagePairs.length > 0 && (
          <Stack>
            <Text opacity={0.5} mb={2}>
              Showing messages in last 7 days
            </Text>

            {loaderData.messagePairs.length === 0 && (
              <Center my={8} flexDir={"column"} gap={2}>
                <Text fontSize={"6xl"} opacity={0.5}>
                  <TbBox />
                </Text>
                <Text textAlign={"center"}>No messages for the filter</Text>
              </Center>
            )}

            {loaderData.messagePairs.length > 0 && (
              <Table.Root variant={"outline"} rounded={"sm"}>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Question</Table.ColumnHeader>
                    <Table.ColumnHeader w={"180px"}></Table.ColumnHeader>
                    <Table.ColumnHeader w={"100px"}>Channel</Table.ColumnHeader>
                    <Table.ColumnHeader w={"200px"} textAlign={"end"}>
                      Time
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {loaderData.messagePairs.map((pair, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Link asChild>
                          <RouterLink
                            to={`/messages?query-message-id=${pair.queryMessage?.id}`}
                          >
                            <SingleLineCell tooltip={false}>
                              {getMessageContent(pair.queryMessage)}
                            </SingleLineCell>
                          </RouterLink>
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Group>
                          {pair.queryMessage?.thread.location && (
                            <CountryFlag
                              location={pair.queryMessage.thread.location}
                            />
                          )}
                          {pair.actionCalls.length > 0 && (
                            <Badge colorPalette={"orange"} variant={"surface"}>
                              <TbPointer />
                              {pair.actionCalls.length}
                            </Badge>
                          )}
                          {pair.maxScore !== undefined && (
                            <Badge
                              colorPalette={getScoreColor(pair.maxScore)}
                              variant={"surface"}
                            >
                              {pair.maxScore.toFixed(2)}
                            </Badge>
                          )}
                          <Rating rating={pair.responseMessage.rating} />
                          {pair.responseMessage.correctionItemId && (
                            <Tooltip content="Corrected the answer" showArrow>
                              <Badge colorPalette={"brand"} variant={"surface"}>
                                <TbSettingsBolt />
                              </Badge>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Cell>
                      <Table.Cell>
                        <ChannelIcon channel={pair.queryMessage?.channel} />
                      </Table.Cell>
                      <Table.Cell textAlign={"end"}>
                        {moment(pair.queryMessage?.createdAt).fromNow()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Stack>
        )}
      </Stack>

      <MessageDrawer
        messagePair={loaderData.messagePair}
        actionsMap={loaderData.actionsMap}
      />
    </Page>
  );
}
