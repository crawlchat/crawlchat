import {
  Group,
  Stack,
  Text,
  Badge,
  EmptyState,
  VStack,
  Link,
  Center,
  Table,
} from "@chakra-ui/react";
import { TbBox, TbMessage, TbPointer, TbSettingsBolt } from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/layout";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import moment from "moment";
import { makeMessagePairs } from "./analyse";
import { Tooltip } from "~/components/ui/tooltip";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import type { Message } from "libs/prisma";
import { getScoreColor } from "~/score";
import { Outlet, Link as RouterLink } from "react-router";
import { ViewSwitch } from "./view-switch";
import { CountryFlag } from "./country-flag";
import { SingleLineCell } from "~/components/single-line-cell";
import { ChannelIcon } from "./channel-icon";
import { Rating } from "./rating-badge";

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

  console.log("fetching messages", new Date());

  return { messagePairs: makeMessagePairs(messages) };
}

function getMessageContent(message?: Message) {
  return (message?.llmMessage as any)?.content ?? "-";
}

export default function MessagesLayout({ loaderData }: Route.ComponentProps) {
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
                          <RouterLink to={`/messages/${pair.queryMessage?.id}`}>
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

      <Outlet />
    </Page>
  );
}

export function shouldRevalidate() {
  return false;
}