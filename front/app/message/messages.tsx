import {
  Group,
  Stack,
  Text,
  Badge,
  EmptyState,
  VStack,
  Heading,
  Link,
  Box,
  Center,
  Icon,
  Button,
  Table,
} from "@chakra-ui/react";
import {
  TbBox,
  TbBrandDiscord,
  TbMessage,
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
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "~/components/ui/accordion";
import moment from "moment";
import { truncate } from "~/util";
import { useMemo } from "react";
import { makeMessagePairs } from "./analyse";
import { Tooltip } from "~/components/ui/tooltip";
import { getSessionScrapeId } from "~/scrapes/util";
import type { Message, MessageChannel } from "libs/prisma";
import { getScoreColor } from "~/score";
import { Link as RouterLink } from "react-router";
import { ViewSwitch } from "./view-switch";
import { CountryFlag } from "./country-flag";

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
      thread: true,
    },
  });

  const scrapes = await prisma.scrape.findMany({
    where: {
      userId: user!.id,
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

  return { messagePairs, scrapes };
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
    return ["Chatbot", TbMessage, "brand"];
  }, [channel]);

  return (
    <Badge colorPalette={color} variant={"surface"}>
      <Icon as={icon} />
      {text}
    </Badge>
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
              <AccordionRoot collapsible variant={"enclosed"}>
                {loaderData.messagePairs.map((pair, index) => (
                  <AccordionItem key={index} value={index.toString()}>
                    <AccordionItemTrigger>
                      <Group justifyContent={"space-between"} flex={1}>
                        <Group>
                          {pair.queryMessage?.thread.location && (
                            <CountryFlag
                              location={pair.queryMessage.thread.location}
                            />
                          )}
                          <Text maxW={"50vw"} truncate>
                            {truncate(
                              getMessageContent(pair.queryMessage),
                              10000
                            )}
                          </Text>
                          <Text opacity={0.2} hideBelow={"md"}>
                            {moment(pair.queryMessage?.createdAt).fromNow()}
                          </Text>
                        </Group>
                        <Group>
                          {pair.responseMessage.rating && (
                            <Tooltip content="Rating from the user" showArrow>
                              <Badge
                                colorPalette={
                                  pair.responseMessage.rating === "up"
                                    ? "green"
                                    : "red"
                                }
                                variant={"surface"}
                              >
                                {pair.responseMessage.rating === "up" ? (
                                  <TbThumbUp />
                                ) : (
                                  <TbThumbDown />
                                )}
                              </Badge>
                            </Tooltip>
                          )}
                          {pair.responseMessage.correctionItemId && (
                            <Tooltip content="Corrected the answer" showArrow>
                              <Badge colorPalette={"brand"} variant={"surface"}>
                                <TbSettingsBolt />
                              </Badge>
                            </Tooltip>
                          )}
                          <ChannelIcon channel={pair.queryMessage?.channel} />
                          <Badge
                            colorPalette={getScoreColor(pair.maxScore)}
                            variant={"surface"}
                          >
                            {pair.maxScore.toFixed(2)}
                          </Badge>
                        </Group>
                      </Group>
                    </AccordionItemTrigger>
                    <AccordionItemContent>
                      <Stack gap={4}>
                        <Heading>
                          {getMessageContent(pair.queryMessage)}
                        </Heading>
                        <MarkdownProse>
                          {getMessageContent(pair.responseMessage)}
                        </MarkdownProse>
                        {pair.uniqueLinks.length > 0 && (
                          <Stack>
                            <Table.Root variant={"outline"}>
                              <Table.Header>
                                <Table.Row>
                                  <Table.ColumnHeader>
                                    Knowledge Item
                                  </Table.ColumnHeader>
                                  <Table.ColumnHeader>Query</Table.ColumnHeader>
                                  <Table.ColumnHeader textAlign="end">
                                    Score
                                  </Table.ColumnHeader>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body background={"brand.white"}>
                                {pair.uniqueLinks.map((link, index) => (
                                  <Table.Row key={index}>
                                    <Table.Cell>
                                      <Link
                                        href={`/knowledge/item/${link.scrapeItemId}`}
                                        target="_blank"
                                      >
                                        {link.title || link.url}
                                      </Link>
                                    </Table.Cell>
                                    <Table.Cell>
                                      {link.searchQuery ?? "-"}
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">
                                      <Badge
                                        colorPalette={getScoreColor(
                                          link.score ?? 0
                                        )}
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

                        <Box>
                          <Button
                            asChild
                            variant={
                              pair.responseMessage.rating === "down" &&
                              !pair.responseMessage.correctionItemId
                                ? "solid"
                                : "outline"
                            }
                          >
                            <RouterLink
                              to={`/messages/${pair.responseMessage?.id}/fix`}
                            >
                              <TbSettingsBolt />
                              Correct it
                              {pair.responseMessage.correctionItemId &&
                                " again"}
                            </RouterLink>
                          </Button>
                        </Box>
                      </Stack>
                    </AccordionItemContent>
                  </AccordionItem>
                ))}
              </AccordionRoot>
            )}
          </Stack>
        )}
      </Stack>
    </Page>
  );
}
