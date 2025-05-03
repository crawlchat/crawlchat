import {
  Alert,
  Center,
  Flex,
  Group,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  TbArrowRight,
  TbCheck,
  TbExternalLink,
  TbSettingsBolt,
} from "react-icons/tb";
import { Page } from "~/components/page";
import ChatBox from "~/dashboard/chat-box";
import type { Route } from "./+types/fix";
import { prisma } from "~/prisma";
import { getAuthUser } from "~/auth/middleware";
import { getSessionScrapeId } from "~/scrapes/util";
import { Link, redirect, useFetcher } from "react-router";
import { createToken } from "~/jwt";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import type { ScrapeItem } from "@prisma/client";

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);

  const scrape = await prisma.scrape.findUnique({
    where: {
      id: scrapeId,
      userId: user!.id,
    },
  });

  if (!scrape) {
    throw redirect("/dashboard");
  }

  const message = await prisma.message.findUnique({
    where: {
      id: params.messageId,
    },
  });

  if (!message) {
    throw redirect("/dashboard");
  }

  const thread = await prisma.thread.findUnique({
    where: {
      id: message.threadId,
    },
    include: {
      messages: true,
    },
  });

  if (!thread) {
    throw redirect("/dashboard");
  }

  const messageIndex = thread.messages.findIndex((m) => m.id === message.id);

  return {
    scrape,
    messages: thread.messages.slice(0, messageIndex + 1),
    thread,
    message,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getAuthUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const answer = formData.get("answer");

  if (intent === "summarise") {
    const token = createToken(user!.id);

    const response = await fetch(`${process.env.VITE_SERVER_URL}/fix-message`, {
      method: "POST",
      body: JSON.stringify({
        messageId: params.messageId,
        answer,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return Response.json({ content: data.content, title: data.title });
  }

  if (intent === "save") {
    const token = createToken(user!.id);

    const message = await prisma.message.findUnique({
      where: {
        id: params.messageId,
      },
    });

    if (!message) {
      throw redirect("/dashboard");
    }

    const markdown = `Updated on ${new Date().toLocaleDateString()}:

  ${formData.get("content")}`;

    const response = await fetch(
      `${process.env.VITE_SERVER_URL}/resource/${message.scrapeId}`,
      {
        method: "POST",
        body: JSON.stringify({
          title: formData.get("title"),
          markdown,
          defaultGroupTitle: "Answer corrections",
          knowledgeGroupType: "answer_corrections",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { scrapeItem } = (await response.json()) as {
      scrapeItem: ScrapeItem;
    };

    await prisma.message.update({
      where: {
        id: params.messageId,
      },
      data: {
        correctionItemId: scrapeItem.id,
      },
    });

    throw redirect(`/knowledge/item/${scrapeItem.id}`);
  }
}

export default function FixMessage({ loaderData }: Route.ComponentProps) {
  const summarizeFetcher = useFetcher();
  const saveFetcher = useFetcher();

  return (
    <Page title="Fix message" icon={<TbSettingsBolt />} noPadding>
      <Flex h="full">
        <Stack
          maxW="300px"
          w="full"
          borderRight={"1px solid"}
          borderColor="brand.outline"
          h="full"
          maxH={"calc(100dvh - 60px)"}
          gap={4}
          overflowY={"auto"}
          p={4}
        >
          {/* <Text opacity={0.5}>
            Here is the conversation up to the message you want to fix. You can
            prompt the AI to frame the correct answer.
          </Text> */}
          <Text opacity={0.5}>
            You can attach your answer below and the AI will summarise the fix.
            It finally adds it to the knowledge base so that this will be
            considered for further answers.
          </Text>

          {loaderData.message.correctionItemId && (
            <Alert.Root status="info" title="This is the alert title">
              <Alert.Indicator />
              <Alert.Title>
                This message is already corrected{" "}
                <Link
                  to={`/knowledge/item/${loaderData.message.correctionItemId}`}
                  style={{ display: "inline-block" }}
                >
                  <TbExternalLink />
                </Link>
              </Alert.Title>
            </Alert.Root>
          )}

          {!summarizeFetcher.data && (
            <summarizeFetcher.Form method="post">
              <input type="hidden" name="intent" value={"summarise"} />
              <Textarea
                placeholder="Enter the correct answer/fix here"
                rows={4}
                autoresize
                name="answer"
                disabled={saveFetcher.state !== "idle"}
              />
              <Group justifyContent={"flex-end"} w="full">
                <Button
                  type="submit"
                  loading={summarizeFetcher.state !== "idle"}
                >
                  Summarise
                  <TbArrowRight />
                </Button>
              </Group>
            </summarizeFetcher.Form>
          )}

          {summarizeFetcher.data && (
            <saveFetcher.Form method="post">
              <Stack>
                <input type="hidden" name="intent" value={"save"} />
                <Field label="Title">
                  <Input
                    name="title"
                    defaultValue={summarizeFetcher.data.title}
                    disabled={saveFetcher.state !== "idle"}
                  />
                </Field>
                <Field label="Answer">
                  <Textarea
                    placeholder="Answer to add as knowledge"
                    rows={4}
                    autoresize
                    name="content"
                    defaultValue={summarizeFetcher.data.content}
                    disabled={saveFetcher.state !== "idle"}
                  />
                </Field>
                <Group justifyContent={"flex-end"} w="full">
                  <Button type="submit" loading={saveFetcher.state !== "idle"}>
                    Save
                    <TbCheck />
                  </Button>
                </Group>
              </Stack>
            </saveFetcher.Form>
          )}
        </Stack>
        <Stack h="full" flex={1} bg="brand.gray.100">
          <Center h="full" w="full">
            <ChatBox
              thread={loaderData.thread}
              scrape={loaderData.scrape}
              userToken={"NA"}
              key={loaderData.thread.id}
              onBgClick={() => {}}
              onPin={() => {}}
              onUnpin={() => {}}
              onErase={() => {}}
              onDelete={() => {}}
              onRate={() => {}}
              messages={loaderData.messages}
              showScore
            />
          </Center>
        </Stack>
      </Flex>
    </Page>
  );
}
