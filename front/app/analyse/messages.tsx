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
} from "@chakra-ui/react";
import { TbBox, TbLink, TbMessage } from "react-icons/tb";
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

const MetricCheckbox = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: number;
  onToggle: (checked: boolean) => void;
}) => {
  return (
    <CheckboxCard.Root onCheckedChange={(e) => onToggle(!!e.checked)}>
      <CheckboxCard.HiddenInput />
      <CheckboxCard.Control>
        <CheckboxCard.Content>
          <Text opacity={0.5}>{label}</Text>
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
              />
              <MetricCheckbox
                label="Bad"
                value={metrics.bad}
                onToggle={(checked) => setFilters({ ...filters, bad: checked })}
              />
              <MetricCheckbox
                label="Good"
                value={metrics.good}
                onToggle={(checked) =>
                  setFilters({ ...filters, good: checked })
                }
              />
              <MetricCheckbox
                label="Best"
                value={metrics.best}
                onToggle={(checked) =>
                  setFilters({ ...filters, best: checked })
                }
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
                            {truncate(
                              (pair.queryMessage?.llmMessage as any).content,
                              10000
                            )}
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
                          {(pair.queryMessage?.llmMessage as any).content}
                        </Heading>
                        <MarkdownProse>
                          {(pair.responseMessage.llmMessage as any).content}
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
