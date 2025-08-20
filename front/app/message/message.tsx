import {
  Group,
  Stack,
  Text,
  Badge,
  Link,
  Table,
  Drawer,
  Portal,
  IconButton,
  Heading,
  DataList,
} from "@chakra-ui/react";
import { TbCopy, TbSettingsBolt } from "react-icons/tb";
import { MarkdownProse } from "~/widget/markdown-prose";
import moment from "moment";
import { useMemo, useState } from "react";
import { makeMessagePairs, type MessagePair } from "./analyse";
import { prisma, type ApiAction, type Message } from "libs/prisma";
import { getScoreColor } from "~/score";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";
import { CountryFlag } from "./country-flag";
import { extractCitations } from "libs/citation";
import { Button } from "~/components/ui/button";
import { truncate } from "~/util";
import { toaster } from "~/components/ui/toaster";
import type { Route } from "./+types/message";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { ChannelIcon } from "./channel-icon";
import { Rating } from "./rating-badge";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const queryMessage = await prisma.message.findUnique({
    where: {
      id: params.queryMessageId,
    },
  });

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      threadId: queryMessage?.threadId,
    },
    include: {
      thread: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const messagePairs = makeMessagePairs(messages);
  const messagePair = messagePairs.find(
    (pair) => pair.queryMessage?.id === params.queryMessageId
  );

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
    <Stack gap={4}>
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
          <Heading size={"lg"}>Resources</Heading>
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
                  <DataList.ItemValue>{call.statusCode}</DataList.ItemValue>
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
    </Stack>
  );
}

export default function Message({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const messagePair = loaderData.messagePair;
  const actionsMap = loaderData.actionsMap;

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
            <Drawer.Body py={0}>
              {messagePair && (
                <AssistantMessage
                  message={messagePair.responseMessage}
                  actionsMap={actionsMap}
                />
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Close
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
