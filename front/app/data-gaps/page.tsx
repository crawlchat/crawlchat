import {
  Center,
  EmptyState,
  Group,
  IconButton,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  TbChartBarOff,
  TbCheck,
  TbExternalLink,
  TbMessage,
  TbTrash,
} from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/page";
import { getAuthUser } from "~/auth/middleware";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { prisma } from "~/prisma";
import type { Message } from "libs/prisma";
import { MarkdownProse } from "~/widget/markdown-prose";
import { Button } from "~/components/ui/button";
import { Link, useFetcher } from "react-router";
import moment from "moment";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      AND: [
        {
          analysis: {
            isNot: {
              dataGapTitle: null,
            },
          },
        },
        {
          analysis: {
            isNot: {
              dataGapDone: true,
            },
          },
        },
      ],
      createdAt: {
        gte: ONE_WEEK_AGO,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { messages };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "done") {
    const messageId = formData.get("messageId") as string;
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        analysis: {
          upsert: {
            set: {
              dataGapDone: true,
            },
            update: {
              dataGapDone: true,
            },
          },
        },
      },
    });

    return { success: true };
  }

  if (intent === "delete") {
    const messageId = formData.get("messageId") as string;
    await prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        analysis: {
          upsert: {
            set: {
              dataGapTitle: null,
              dataGapDescription: null,
            },
            update: {
              dataGapTitle: null,
              dataGapDescription: null,
            },
          },
        },
      },
    });

    return { success: true };
  }
}

function DataGapCard({ message }: { message: Message }) {
  const doneFetcher = useFetcher();
  const deleteFetcher = useFetcher();

  return (
    <Stack
      border="1px solid"
      borderColor="brand.outline"
      p={4}
      borderRadius="md"
      gap={0}
    >
      <Stack>
        <Text fontWeight="bold">{message.analysis!.dataGapTitle}</Text>
        <Group>
          <Button variant="subtle" size="xs" asChild>
            <Link to={`/messages/${message.questionId}`}>
              Message
              <TbExternalLink />
            </Link>
          </Button>
          <doneFetcher.Form method="post">
            <input type="hidden" name="messageId" value={message.id} />
            <input type="hidden" name="intent" value="done" />
            <Button
              variant="subtle"
              size="xs"
              colorPalette={"brand"}
              type="submit"
              loading={doneFetcher.state !== "idle"}
            >
              Done
              <TbCheck />
            </Button>
          </doneFetcher.Form>
          <deleteFetcher.Form method="post">
            <input type="hidden" name="messageId" value={message.id} />
            <input type="hidden" name="intent" value="delete" />
            <IconButton
              variant="subtle"
              size="xs"
              colorPalette={"red"}
              disabled={deleteFetcher.state !== "idle"}
              type="submit"
            >
              {deleteFetcher.state !== "idle" ? (
                <Spinner size="xs" />
              ) : (
                <TbTrash />
              )}
            </IconButton>
          </deleteFetcher.Form>
        </Group>
      </Stack>
      <MarkdownProse>{message.analysis!.dataGapDescription}</MarkdownProse>
      <Text fontSize={"sm"} opacity={0.5}>
        {moment(message.createdAt).fromNow()}
      </Text>
    </Stack>
  );
}

export default function DataGapsPage({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Data gaps" icon={<TbChartBarOff />}>
      <Stack h="full">
        {loaderData.messages.length === 0 && (
          <Center h="full">
            <EmptyState.Root maxW="md">
              <EmptyState.Content>
                <EmptyState.Indicator>
                  <TbCheck />
                </EmptyState.Indicator>
                <VStack textAlign="center">
                  <EmptyState.Title>No data gaps</EmptyState.Title>
                  <EmptyState.Description>
                    You are sorted! There are no data gaps found in the last
                    week. If you have not yet integrated the chatbot, integrate
                    it now so it finds the data gaps automatically.
                  </EmptyState.Description>
                </VStack>
              </EmptyState.Content>
            </EmptyState.Root>
          </Center>
        )}
        {loaderData.messages.map((message) => (
          <DataGapCard key={message.id} message={message} />
        ))}
      </Stack>
    </Page>
  );
}
