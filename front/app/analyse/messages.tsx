import { Group, Stack, Text, Badge } from "@chakra-ui/react";
import { TbMessage } from "react-icons/tb";
import { Page } from "~/components/page";
import type { Route } from "./+types/messages";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "~/prisma";
import type { Message } from "libs/prisma";
import { MarkdownProse } from "~/widget/markdown-prose";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "~/components/ui/accordion";
import moment from "moment";
import { truncate } from "~/util";

type MessagePair = {
  queryMessage?: Message;
  responseMessage: Message;
  maxScore: number;
  minScore: number;
  uniqueLinks: string[];
};

function makeMessagePairs(messages: Message[]) {
  function findUserMessage(i: number, threadId: string) {
    for (let j = i; j >= 0; j--) {
      if (messages[j].threadId !== threadId) {
        continue;
      }
      if ((messages[j].llmMessage as any).role === "user") {
        return messages[j];
      }
    }
  }

  const messagePairs: MessagePair[] = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const { links } = message;
    if (links.length === 0) {
      continue;
    }
    const maxScore = Math.max(
      ...links.filter((l) => l.score !== null).map((l) => l.score!)
    );
    const minScore = Math.min(
      ...links.filter((l) => l.score !== null).map((l) => l.score!)
    );

    messagePairs.push({
      queryMessage: findUserMessage(i, message.threadId),
      responseMessage: message,
      maxScore,
      minScore,
      uniqueLinks: links
        .filter((l) => l.score !== null)
        .map((l) => l.url as string)
        .filter((u, i, a) => i === a.findIndex((u2) => u2 === u)),
    });
  }

  return messagePairs.sort(
    (a, b) =>
      (b.responseMessage.createdAt?.getTime() ?? 0) -
      (a.responseMessage.createdAt?.getTime() ?? 0)
  );
}

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
  });

  return { messagePairs: makeMessagePairs(messages) };
}

export default function Messages({ loaderData }: Route.ComponentProps) {
  function getScoreColor(score: number) {
    if (score < 0.3) {
      return "red";
    }
    if (score < 0.5) {
      return "orange";
    }
    return "brand";
  }

  return (
    <Page title="Messages" icon={<TbMessage />}>
      <Stack>
        <AccordionRoot collapsible defaultValue={["b"]} variant={"enclosed"}>
          {loaderData.messagePairs.map((pair, index) => (
            <AccordionItem key={index} value={index.toString()}>
              <AccordionItemTrigger>
                <Group justifyContent={"space-between"} flex={1}>
                  <Group>
                    <Text>
                      {truncate(
                        (pair.queryMessage?.llmMessage as any).content,
                        60
                      )}
                    </Text>
                    <Text opacity={0.2}>
                      {moment(pair.queryMessage?.createdAt).fromNow()}
                    </Text>
                  </Group>
                  <Group>
                    <Badge
                      colorPalette={getScoreColor(pair.minScore)}
                      variant={"surface"}
                    >
                      {pair.minScore.toFixed(2)} - {pair.maxScore.toFixed(2)}
                    </Badge>
                  </Group>
                </Group>
              </AccordionItemTrigger>
              <AccordionItemContent>
                <MarkdownProse>
                  {(pair.responseMessage.llmMessage as any).content}
                </MarkdownProse>
              </AccordionItemContent>
            </AccordionItem>
          ))}
        </AccordionRoot>
      </Stack>
    </Page>
  );
}
