import { prisma } from "~/prisma";
import type { Route } from "./+types/scrape";
import {
  Box,
  Center,
  Group,
  IconButton,
  Input,
  Link,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { TbArrowUp, TbChevronRight } from "react-icons/tb";
import { useScrapeChat } from "./use-chat";
import { createToken } from "~/jwt";
import { useEffect, useState } from "react";
import { Prose } from "~/components/ui/prose";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function loader({ params }: Route.LoaderArgs) {
  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id },
  });
  const userToken = await createToken("6790c3cc84f4e51db33779c5");
  const thread = await prisma.thread.findFirstOrThrow({
    where: { id: "67b51f867222da88524d7dae" },
  });
  return { scrape, userToken, thread };
}

function ChatInput({ onAsk }: { onAsk: (query: string) => void }) {
  const [query, setQuery] = useState("");

  function handleAsk() {
    onAsk(query);
    setQuery("");
  }

  return (
    <Group
      h="60px"
      borderTop={"1px solid"}
      borderColor={"brand.outline"}
      justify={"space-between"}
      p={4}
    >
      <Group flex={1}>
        <Input
          placeholder="Ask your question about Remotion"
          size={"xl"}
          p={0}
          outline={"none"}
          border="none"
          fontSize={"lg"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAsk();
            }
          }}
        />
      </Group>
      <Group>
        <IconButton rounded={"full"} onClick={handleAsk}>
          <TbArrowUp />
        </IconButton>
      </Group>
    </Group>
  );
}

function MessageContent({ content }: { content: string }) {
  return (
    <Prose maxW="full">
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </Prose>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <Stack
      borderTop={"1px solid"}
      borderColor={"brand.outline"}
      className="user-message"
      p={4}
    >
      <Text fontSize={"2xl"} fontWeight={"bolder"} opacity={0.5}>
        {content}
      </Text>
    </Stack>
  );
}

function AssistantMessage({
  content,
  links,
}: {
  content: string;
  links: { url: string; title: string | null }[];
}) {
  return (
    <Stack>
      <Stack p={4} pt={0}>
        <MessageContent content={content} />
      </Stack>
      {links.length > 0 && (
        <Stack
          borderTop="1px solid"
          borderColor={"brand.outline"}
          gap={0}
        >
          {links.map((link, index) => (
            <Stack
              key={index}
              px={4}
              py={3}
              borderBottom={"1px solid"}
              borderColor={"brand.outline"}
              _last={{ borderBottom: "none" }}
              _hover={{
                bg: "brand.gray.100",
              }}
              transition={"background-color 100ms ease-in-out"}
            >
              <Group justify={"space-between"}>
                <Stack gap={0}>
                  <Text fontSize={"xs"} lineClamp={1}>
                    {link.title}
                  </Text>
                  <Link fontSize={"xs"} opacity={0.5} lineClamp={1}>
                    {link.url}
                  </Link>
                </Stack>
                <Box>
                  <TbChevronRight />
                </Box>
              </Group>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function LoadingMessage() {
  return (
    <Stack p={4}>
      <Skeleton h={"20px"} w={"100%"} />
      <Skeleton h={"20px"} w={"100%"} />
      <Skeleton h={"20px"} w={"60%"} />
    </Stack>
  );
}

export default function ScrapeWidget({
  params,
  loaderData,
}: Route.ComponentProps) {
  const chat = useScrapeChat({
    token: loaderData.userToken,
    scrapeId: params.id,
    defaultMessages: loaderData.thread.messages,
    threadId: loaderData.thread.id,
  });

  useEffect(function () {
    chat.connect();
    return () => chat.disconnect();
  }, []);

  useEffect(
    function () {
      scroll();
    },
    [chat.messages]
  );

  async function handleAsk(query: string) {
    chat.ask(query);
    await scroll();
  }

  async function scroll() {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const message = document.querySelectorAll(`.user-message`);
    if (message) {
      message[message.length - 1].scrollIntoView({ behavior: "smooth" });
    }
  }

  const messages = chat.allMessages();

  return (
    <Center h="100dvh" bg="brand.gray.100">
      <Stack
        border="1px solid"
        borderColor={"brand.outline"}
        rounded={"xl"}
        boxShadow={"rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"}
        bg="brand.white"
        w={"full"}
        maxW={"500px"}
        h="full"
        maxH={"500px"}
        overflow={"hidden"}
        gap={0}
      >
        <Stack flex="1" overflow={"auto"} gap={0}>
          {messages.map((message, index) => (
            <Stack key={index}>
              {message.role === "user" ? (
                <UserMessage content={message.content} />
              ) : (
                <AssistantMessage
                  content={message.content}
                  links={message.links}
                />
              )}
              {chat.askStage === "asked" && index === messages.length - 1 && (
                <LoadingMessage />
              )}
              {chat.askStage !== "idle" && index === messages.length - 1 && (
                <Box h="500px" w="full" />
              )}
            </Stack>
          ))}
        </Stack>
        <ChatInput onAsk={handleAsk} />
      </Stack>
    </Center>
  );
}
