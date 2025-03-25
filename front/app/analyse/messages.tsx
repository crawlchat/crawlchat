import {
  Group,
  Stack,
  Text,
  Badge,
  EmptyState,
  VStack,
  Heading,
  List,
  Link,
  Flex,
  Box,
  Center,
  createListCollection,
  CheckboxCard,
  IconButton,
  Popover,
  Portal,
  Highlight,
  Icon,
} from "@chakra-ui/react";
import { TbBox, TbHelp, TbLink, TbMessage } from "react-icons/tb";
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
import { useEffect, useMemo, useState } from "react";
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "~/components/ui/select";
import { makeMessagePairs } from "./analyse";
import { Tooltip } from "~/components/ui/tooltip";
import type { Message } from "libs/prisma";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      ownerUserId: user!.id,
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

  return { messagePairs: makeMessagePairs(messages), scrapes };
}

function getMessageContent(message?: Message) {
  return (message?.llmMessage as any)?.content ?? "-";
}

const MetricCheckbox = ({
  label,
  value,
  onToggle,
  tooltip,
}: {
  label: string;
  value: number;
  onToggle: (checked: boolean) => void;
  tooltip?: string;
}) => {
  return (
    <CheckboxCard.Root onCheckedChange={(e) => onToggle(!!e.checked)}>
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <Group>
            <Text opacity={0.5}>{label}</Text>
            <Tooltip
              content={tooltip}
              showArrow
              positioning={{ placement: "top" }}
            >
              <Icon opacity={0.5}>
                <TbHelp />
              </Icon>
            </Tooltip>
          </Group>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {value}
          </Text>
        </CheckboxCard.Content>
        <CheckboxCard.Indicator />
      </CheckboxCard.Control>
    </CheckboxCard.Root>
  );
};

export default function Messages({ loaderData }: Route.ComponentProps) {
  const [pairs, setPairs] = useState(loaderData.messagePairs);
  const [scrapeId, setScrapeId] = useState<string>();
  const metrics = useMemo(
    () => ({
      worst: loaderData.messagePairs.filter((p) => p.averageScore < 0.25)
        .length,
      bad: loaderData.messagePairs.filter((p) => p.averageScore < 0.5).length,
      good: loaderData.messagePairs.filter((p) => p.averageScore < 0.75).length,
      best: loaderData.messagePairs.filter((p) => p.averageScore > 0.75).length,
    }),
    [loaderData.messagePairs]
  );
  const scrapesCollection = useMemo(
    () =>
      createListCollection({
        items: loaderData.scrapes.map((scrape) => ({
          label: scrape.title ?? scrape.url ?? "Untitled",
          value: scrape.id,
        })),
      }),
    [loaderData.scrapes]
  );
  const [filters, setFilters] = useState<{
    worst?: boolean;
    bad?: boolean;
    good?: boolean;
    best?: boolean;
  }>({});

  useEffect(() => {
    let pairs = loaderData.messagePairs;

    if (scrapeId) {
      pairs = pairs.filter((p) => p.scrapeId === scrapeId);
    }

    let scores = [[-10, 10]];
    if (Object.values(filters).filter(Boolean).length > 0) {
      scores = [];

      const filterToScore: Record<string, number[]> = {
        best: [0.75, 10],
        good: [0.5, 0.75],
        bad: [0.25, 0.5],
        worst: [-10, 0.25],
      };

      for (const filter of Object.keys(filters)) {
        if (filters[filter as keyof typeof filters]) {
          scores.push(filterToScore[filter]);
        }
      }
    }

    let filteredPairs = [];
    for (const pair of pairs) {
      const score = pair.averageScore;
      for (const [min, max] of scores) {
        if (score >= min && score < max) {
          filteredPairs.push(pair);
        }
      }
    }
    setPairs(filteredPairs);
  }, [scrapeId, loaderData.messagePairs, filters]);

  function getScoreColor(score: number) {
    if (score < 0.25) {
      return "red";
    }
    if (score < 0.5) {
      return "orange";
    }
    if (score < 0.75) {
      return "blue";
    }
    return "brand";
  }

  return (
    <Page title="Messages" icon={<TbMessage />}>
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
            <Flex justifyContent={"flex-end"} gap={2}>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <IconButton variant={"ghost"}>
                    <TbHelp />
                  </IconButton>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Arrow>
                        <Popover.ArrowTip />
                      </Popover.Arrow>
                      <Popover.Body>
                        <Stack>
                          <Text>
                            <Highlight
                              query={["0 and 1", "0 is worst", "1 is best"]}
                              styles={{ color: "brand.fg", fontWeight: "bold" }}
                            >
                              When the AI tries to answer a question, it fetches
                              relavent records from the collection. Each record
                              is given a score between 0 and 1 dependending on
                              the relavence of the record to the query. 0 is
                              worst and 1 is best.
                            </Highlight>
                          </Text>
                          <Text>
                            <Highlight
                              query={["average"]}
                              styles={{ color: "brand.fg", fontWeight: "bold" }}
                            >
                              Each query can have multiple such records fetched
                              to answer the query. The score shown next to the
                              question is the average of all the scores of the
                              records fetched.
                            </Highlight>
                          </Text>
                        </Stack>
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>

              <Box>
                <SelectRoot
                  collection={scrapesCollection}
                  w="300px"
                  value={scrapeId ? [scrapeId] : []}
                  onValueChange={(e) => setScrapeId(e.value[0])}
                >
                  <SelectTrigger clearable>
                    <SelectValueText placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {scrapesCollection.items.map((item) => (
                      <SelectItem item={item} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Box>
            </Flex>

            <Flex gap={2}>
              <MetricCheckbox
                label="Worst"
                value={metrics.worst}
                onToggle={(checked) =>
                  setFilters({ ...filters, worst: checked })
                }
                tooltip="0 - 0.25"
              />
              <MetricCheckbox
                label="Bad"
                value={metrics.bad}
                onToggle={(checked) => setFilters({ ...filters, bad: checked })}
                tooltip="0.25 - 0.5"
              />
              <MetricCheckbox
                label="Good"
                value={metrics.good}
                onToggle={(checked) =>
                  setFilters({ ...filters, good: checked })
                }
                tooltip="0.5 - 0.75"
              />
              <MetricCheckbox
                label="Best"
                value={metrics.best}
                onToggle={(checked) =>
                  setFilters({ ...filters, best: checked })
                }
                tooltip="0.75 - 1"
              />
            </Flex>

            {pairs.length === 0 && (
              <Center my={8} flexDir={"column"} gap={2}>
                <Text fontSize={"6xl"} opacity={0.5}>
                  <TbBox />
                </Text>
                <Text textAlign={"center"}>No messages for the filter</Text>
              </Center>
            )}

            {pairs.length > 0 && (
              <AccordionRoot
                collapsible
                defaultValue={["b"]}
                variant={"enclosed"}
              >
                {pairs.map((pair, index) => (
                  <AccordionItem key={index} value={index.toString()}>
                    <AccordionItemTrigger>
                      <Group justifyContent={"space-between"} flex={1}>
                        <Group>
                          <Text maxW={"50vw"} truncate>
                            {truncate(getMessageContent(pair.queryMessage), 10000)}
                          </Text>
                          <Text opacity={0.2} hideBelow={"md"}>
                            {moment(pair.queryMessage?.createdAt).fromNow()}
                          </Text>
                        </Group>
                        <Group>
                          <Badge
                            colorPalette={getScoreColor(pair.averageScore)}
                            variant={"surface"}
                          >
                            {pair.averageScore.toFixed(2)}
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
                            <Heading>Resources</Heading>
                            <List.Root variant={"plain"}>
                              {pair.uniqueLinks.map((link) => (
                                <List.Item key={link.scrapeItemId}>
                                  <List.Indicator asChild color="brand.fg">
                                    <TbLink />
                                  </List.Indicator>
                                  <Link
                                    href={`/collections/${pair.scrapeId}/links/${link.scrapeItemId}`}
                                    target="_blank"
                                  >
                                    {link.title}{" "}
                                    <Badge
                                      colorPalette={getScoreColor(
                                        link.score ?? 0
                                      )}
                                    >
                                      {link.score?.toFixed(2)}
                                    </Badge>
                                  </Link>
                                </List.Item>
                              ))}
                            </List.Root>
                          </Stack>
                        )}
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
