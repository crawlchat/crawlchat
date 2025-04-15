import {
  Accordion,
  Badge,
  Box,
  Center,
  Group,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  Kbd,
  Link,
  Skeleton,
} from "@chakra-ui/react";
import { Stack, Text } from "@chakra-ui/react";
import type {
  Message,
  MessageSourceLink,
  Scrape,
  Thread,
  WidgetSize,
} from "libs/prisma";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TbArrowUp,
  TbChevronRight,
  TbEraser,
  TbHelp,
  TbMessage,
  TbPin,
  TbRefresh,
  TbRobotFace,
  TbTrash,
  TbPointer,
} from "react-icons/tb";
import { useScrapeChat, type AskStage } from "~/widget/use-chat";
import { MarkdownProse } from "~/widget/markdown-prose";
import { InputGroup } from "~/components/ui/input-group";
import { Tooltip } from "~/components/ui/tooltip";
import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuRoot,
  MenuTrigger,
} from "~/components/ui/menu";
import { track } from "~/pirsch";
import { Link as RouterLink } from "react-router";
import { extractCitations } from "libs/citation";
import { Button } from "~/components/ui/button";
import { makeCursorMcpJson, makeMcpCommand, makeMcpName } from "~/mcp/setup";

function ChatInput({
  onAsk,
  stage,
  searchQuery,
  disabled,
  scrape,
}: {
  onAsk: (query: string) => void;
  stage: AskStage;
  searchQuery?: string;
  disabled?: boolean;
  scrape: Scrape;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(function () {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleOnMessage = (event: MessageEvent) => {
      if (event.data === "focus") {
        inputRef.current?.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !inputRef.current?.matches(":focus")) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("message", handleOnMessage);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("message", handleOnMessage);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleAsk() {
    onAsk(query);
    track("chat_ask", { query });
    setQuery("");
  }

  function getPlaceholder() {
    switch (stage) {
      case "asked":
        return "😇 Thinking...";
      case "answering":
        return "🤓 Answering...";
      case "searching":
        return `🔍 Searching for "${searchQuery ?? "answer"}"`;
    }
    return scrape.widgetConfig?.textInputPlaceholder ?? "Ask your question";
  }

  const isDisabled = disabled || stage !== "idle";

  return (
    <Group
      h="60px"
      borderTop={"1px solid"}
      borderColor={"brand.outline"}
      justify={"space-between"}
      p={4}
    >
      <Group flex={1}>
        <InputGroup flex="1" endElement={<Kbd>⏎</Kbd>}>
          <Input
            ref={inputRef}
            placeholder={getPlaceholder()}
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
            disabled={isDisabled}
          />
        </InputGroup>
      </Group>
      <Group>
        <IconButton
          rounded={"full"}
          onClick={handleAsk}
          size={"xs"}
          disabled={isDisabled}
        >
          <TbArrowUp />
        </IconButton>
      </Group>
    </Group>
  );
}

function SourceLink({
  link,
  index,
}: {
  link: MessageSourceLink;
  index: number;
}) {
  return (
    <Link
      borderBottom={"1px solid"}
      borderColor={"brand.outline"}
      _hover={{
        bg: "brand.gray.100",
      }}
      transition={"background-color 100ms ease-in-out"}
      variant={"plain"}
      href={link.url ?? undefined}
      target="_blank"
      textDecoration={"none"}
      outline={"none"}
    >
      <Stack px={4} py={3} w="full">
        <Group justify={"space-between"} w="full">
          <Stack gap={0}>
            <Text fontSize={"xs"} lineClamp={1} data-score={link.score}>
              {link.title}
            </Text>
            <Text fontSize={"xs"} opacity={0.5} lineClamp={1}>
              {link.url}
            </Text>
          </Stack>
          <Group>
            <Badge colorPalette={"brand"}>{index + 1}</Badge>
            <TbChevronRight />
          </Group>
        </Group>
      </Stack>
    </Link>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <Stack
      borderTop={"1px solid"}
      borderColor={"brand.outline"}
      className="user-message"
      p={4}
      pb={0}
    >
      <Text fontSize={"2xl"} fontWeight={"bolder"} opacity={0.8}>
        {content}
      </Text>
    </Stack>
  );
}

function AssistantMessage({
  content,
  links,
  pinned,
  onPin,
  onUnpin,
  onDelete,
  onRefresh,
  size,
}: {
  content: string;
  links: MessageSourceLink[];
  pinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  size?: WidgetSize;
}) {
  const [cleanedLinks, cleanedContent] = useMemo(() => {
    const citation = extractCitations(content, links);
    return [citation.citedLinks, citation.content];
  }, [links]);

  return (
    <Stack>
      <Stack px={4} gap={0}>
        <MarkdownProse
          size={size === "large" ? "lg" : "md"}
          sources={Object.values(cleanedLinks).map((link) => ({
            title: link?.title ?? link?.url ?? "Source",
            url: link?.url ?? undefined,
          }))}
        >
          {cleanedContent}
        </MarkdownProse>
        <Group pb={Object.keys(cleanedLinks).length === 0 ? 4 : 0}>
          <Tooltip content="Pin message" showArrow>
            <IconButton
              size={"xs"}
              rounded={"full"}
              variant={pinned ? "solid" : "subtle"}
              onClick={pinned ? onUnpin : onPin}
            >
              <TbPin />
            </IconButton>
          </Tooltip>
          <Tooltip content="Delete message" showArrow>
            <IconButton
              size={"xs"}
              rounded={"full"}
              variant={"subtle"}
              onClick={onDelete}
            >
              <TbTrash />
            </IconButton>
          </Tooltip>
          <Tooltip content="Regenerate message" showArrow>
            <IconButton
              size={"xs"}
              rounded={"full"}
              variant={"subtle"}
              onClick={onRefresh}
            >
              <TbRefresh />
            </IconButton>
          </Tooltip>
        </Group>
      </Stack>
      {Object.keys(cleanedLinks).length > 0 && (
        <Stack gap={0}>
          <Stack borderTop="1px solid" borderColor={"brand.outline"} gap={0}>
            {Object.entries(cleanedLinks)
              .filter(([_, link]) => link)
              .map(([index, link]) => (
                <SourceLink key={index} link={link} index={Number(index)} />
              ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

function NoMessages({
  scrape,
  onQuestionClick,
}: {
  scrape: Scrape;
  onQuestionClick: (question: string) => void;
}) {
  const shouldShowDefaultTitle = !scrape.widgetConfig?.welcomeMessage;
  return (
    <Stack p={4} justify={"center"} align={"center"} h="full" gap={4}>
      {shouldShowDefaultTitle && (
        <Stack align={"center"} mb={8}>
          <Text opacity={0.5}>
            <TbMessage size={"60px"} />
          </Text>
          <Heading size={"2xl"} px={4} textAlign={"center"}>
            {scrape.title}
          </Heading>
        </Stack>
      )}

      {scrape.widgetConfig?.welcomeMessage && (
        <Stack w="full" maxW={"400px"}>
          <MarkdownProse>{scrape.widgetConfig?.welcomeMessage}</MarkdownProse>
        </Stack>
      )}

      {scrape.widgetConfig?.questions &&
        scrape.widgetConfig.questions.length > 0 && (
          <Stack w="full" maxW={"400px"}>
            <Heading size={"xs"} opacity={0.5}>
              QUICK QUESTIONS
            </Heading>
            <Stack w="full">
              {scrape.widgetConfig?.questions.map((question, i) => (
                <Group
                  key={i}
                  border={"1px solid"}
                  borderColor={"brand.outline"}
                  rounded={"md"}
                  p={2}
                  px={3}
                  w="full"
                  _hover={{
                    bg: "brand.gray.100",
                  }}
                  transition={"background-color 200ms ease-in-out"}
                  cursor={"pointer"}
                  alignItems={"flex-start"}
                  onClick={() => onQuestionClick(question.text)}
                >
                  <Box mt={1}>
                    <TbHelp />
                  </Box>
                  <Text>{question.text}</Text>
                </Group>
              ))}
            </Stack>
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

function MCPSetup({ scrape }: { scrape: Scrape }) {
  const [section, setSection] = useState<string>("mcp-command");
  const sections = useMemo(
    () => [
      {
        value: "mcp-command",
        icon: <TbRobotFace />,
        title: "MCP Command",
        script: makeMcpCommand(scrape.id, makeMcpName(scrape)),
        language: "sh",
      },
      {
        value: "stats",
        icon: <TbPointer />,
        title: "Cursor",
        script: makeCursorMcpJson(scrape.id, makeMcpName(scrape)),
        language: "json",
      },
    ],
    [scrape]
  );

  return (
    <Stack h="full" p={4}>
      <Stack align={"center"} py={4}>
        <Stack w="full" maxW={"400px"} gap={8}>
          <Stack>
            <Heading>
              <Group>
                <TbRobotFace />
                <Text>Setup MCP client</Text>
              </Group>
            </Heading>
            <Text opacity={0.5} fontSize={"sm"}>
              <Text as="span" fontWeight={"bold"}>
                Model Context Protocol
              </Text>{" "}
              is a standard way for AI apps to extend the ability to do custom
              actions. You can also use your own AI applications to interact
              with the documentation such as Cursor, Windsurf, Claude or ever
              growing list.
            </Text>
          </Stack>
          <Stack>
            <Group justify={"end"}>
              <Link
                fontSize={"sm"}
                href="https://guides.crawlchat.app/walkthrough/67db0080600010f091e529b7/read"
                target="_blank"
              >
                <TbHelp /> Help
              </Link>
            </Group>
            <Accordion.Root
              value={[section]}
              onValueChange={(e) => setSection(e.value[0])}
              variant={"enclosed"}
            >
              {sections.map((item) => (
                <Accordion.Item key={item.value} value={item.value}>
                  <Accordion.ItemTrigger>
                    <Group justify={"space-between"} w="full">
                      <Group>
                        <Icon fontSize="lg" color="fg.subtle">
                          {item.icon}
                        </Icon>
                        <Text>{item.title}</Text>
                      </Group>

                      <Group></Group>
                    </Group>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      <MarkdownProse noMarginCode>
                        {`\`\`\`${item.language}\n${item.script}\n\`\`\``}
                      </MarkdownProse>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

function Toolbar({
  scrape,
  messages,
  onErase,
  onPinSelect,
  screen,
  onScreenChange,
}: {
  scrape: Scrape;
  messages: Message[];
  onErase: () => void;
  onPinSelect: (id: string) => void;
  screen: "chat" | "mcp";
  onScreenChange: (screen: "chat" | "mcp") => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pinnedCount = useMemo(() => {
    return messages.filter((message) => message.pinnedAt).length;
  }, [messages]);

  useEffect(
    function () {
      if (!confirmDelete) {
        return;
      }

      const timeout = setTimeout(() => setConfirmDelete(false), 3000);
      return () => clearTimeout(timeout);
    },
    [confirmDelete]
  );

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onErase();
  }

  function handlePinSelect(id: string) {
    onPinSelect(id);
  }

  return (
    <Group
      h="60px"
      borderBottom={"1px solid"}
      borderColor={"brand.outline"}
      p={4}
      w={"full"}
      justify={"space-between"}
    >
      <Group>
        <Group>
          {scrape.logoUrl && (
            <Image src={scrape.logoUrl} alt="Logo" w={"34px"} h={"34px"} />
          )}
          <Text fontSize={"xs"} opacity={0.5}>
            By{" "}
            <Link asChild target="_blank" fontWeight={"bold"}>
              <RouterLink to="/">CrawlChat</RouterLink>
            </Link>
          </Text>
        </Group>
      </Group>
      <Group>
        {pinnedCount > 0 && (
          <MenuRoot
            positioning={{ placement: "bottom-end" }}
            onSelect={(e) => handlePinSelect(e.value)}
          >
            <MenuTrigger asChild>
              <IconButton
                size={"xs"}
                rounded={"full"}
                variant={"subtle"}
                position={"relative"}
              >
                <TbPin />
                <Badge
                  ml="1"
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  position={"absolute"}
                  top={-1}
                  right={-1}
                  size={"xs"}
                >
                  {pinnedCount}
                </Badge>
              </IconButton>
            </MenuTrigger>
            <MenuContent>
              <MenuItemGroup title="Pinned messages">
                {messages
                  .filter((m) => m.pinnedAt)
                  .map((message) => (
                    <MenuItem key={message.id} value={message.id}>
                      {(message.llmMessage as any)?.content}
                    </MenuItem>
                  ))}
              </MenuItemGroup>
            </MenuContent>
          </MenuRoot>
        )}

        {screen === "chat" && (
          <Tooltip
            content={confirmDelete ? "Are you sure?" : "Clear chat"}
            open={confirmDelete}
            showArrow
          >
            <IconButton
              size={"xs"}
              rounded={"full"}
              variant={confirmDelete ? "solid" : "subtle"}
              colorPalette={confirmDelete ? "red" : undefined}
              onClick={handleDelete}
            >
              <TbEraser />
            </IconButton>
          </Tooltip>
        )}

        {(scrape.widgetConfig?.showMcpSetup ?? true) && (
          <>
            {screen === "chat" && (
              <Button
                size={"xs"}
                variant={"subtle"}
                onClick={() => onScreenChange("mcp")}
              >
                Setup MCP
                <TbRobotFace />
              </Button>
            )}
            {screen === "mcp" && (
              <Button
                size={"xs"}
                variant={"subtle"}
                onClick={() => onScreenChange("chat")}
              >
                Switch to chat
                <TbMessage />
              </Button>
            )}
          </>
        )}
      </Group>
    </Group>
  );
}

export default function ScrapeWidget({
  thread,
  messages,
  scrape,
  userToken,
  onBgClick,
  onPin,
  onUnpin,
  onErase,
  onDelete,
}: {
  thread: Thread;
  messages: Message[];
  scrape: Scrape;
  userToken: string;
  onBgClick?: () => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onErase: () => void;
  onDelete: (ids: string[]) => void;
}) {
  const chat = useScrapeChat({
    token: userToken,
    scrapeId: scrape.id,
    defaultMessages: messages,
    threadId: thread.id,
  });
  const [screen, setScreen] = useState<"chat" | "mcp">("chat");

  useEffect(function () {
    chat.connect();
    return () => chat.disconnect();
  }, []);

  useEffect(function () {
    scroll();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onBgClick?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === "focus") {
        scroll();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function handleAsk(query: string) {
    chat.ask(query);
    await scroll();
  }

  async function scroll(selector = ".user-message") {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const message = document.querySelectorAll(selector);
    if (message) {
      message[message.length - 1]?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleBgClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onBgClick?.();
    }
  }

  function getSize() {
    switch (scrape.widgetConfig?.size) {
      case "large":
        return { width: "800px", height: "800px" };
      case "full_screen":
        return { width: "100%", height: "100%" };
      default:
        return { width: "500px", height: "500px" };
    }
  }

  function handlePin(id: string) {
    onPin(id);
    chat.pinMessage(id);
  }

  function handleUnpin(id: string) {
    onUnpin(id);
    chat.unpinMessage(id);
  }

  function handleErase() {
    onErase();
    chat.erase();
  }

  function handlePinSelect(id: string) {
    scroll(`#message-${id}`);
  }

  function handleDelete(ids: string[]) {
    onDelete(ids);
    chat.deleteMessage(ids);
  }

  async function handleRefresh(questionId: string, answerId: string) {
    const message = chat.getMessage(questionId);
    if (!message) return;

    onDelete([questionId, answerId]);
    chat.deleteMessage([questionId, answerId]);
    chat.ask((message.llmMessage as any).content as string);
    await scroll();
  }

  const { width, height } = getSize();

  return (
    <Center h="full" onClick={handleBgClick} p={4}>
      <Stack
        border="1px solid"
        borderColor={"brand.outline"}
        rounded={"xl"}
        boxShadow={"rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"}
        bg="brand.white"
        w={"full"}
        maxW={width}
        h="full"
        maxH={height}
        overflow={"hidden"}
        gap={0}
      >
        <Toolbar
          messages={chat.messages}
          onErase={handleErase}
          onPinSelect={handlePinSelect}
          screen={screen}
          onScreenChange={setScreen}
          scrape={scrape}
        />
        <Stack flex="1" overflow={"auto"} gap={0}>
          {screen === "chat" && (
            <>
              {chat.allMessages.length === 0 && (
                <NoMessages scrape={scrape} onQuestionClick={handleAsk} />
              )}
              {chat.allMessages.map((message, index) => (
                <Stack key={index} id={`message-${message.id}`}>
                  {message.role === "user" ? (
                    <UserMessage content={message.content} />
                  ) : (
                    <AssistantMessage
                      size={scrape.widgetConfig?.size}
                      content={message.content}
                      links={message.links}
                      pinned={chat.allMessages[index - 1]?.pinned}
                      onPin={() => handlePin(chat.allMessages[index - 1]?.id)}
                      onUnpin={() =>
                        handleUnpin(chat.allMessages[index - 1]?.id)
                      }
                      onDelete={() =>
                        handleDelete([
                          chat.allMessages[index - 1]?.id,
                          message.id,
                        ])
                      }
                      onRefresh={() =>
                        handleRefresh(
                          chat.allMessages[index - 1]?.id,
                          message.id
                        )
                      }
                    />
                  )}
                  {(chat.askStage === "asked" ||
                    chat.askStage === "searching") &&
                    index === chat.allMessages.length - 1 && <LoadingMessage />}
                  {chat.askStage !== "idle" &&
                    index === chat.allMessages.length - 1 && (
                      <Box h={"2000px"} w="full" />
                    )}
                </Stack>
              ))}
            </>
          )}
          {screen === "mcp" && <MCPSetup scrape={scrape} />}
        </Stack>
        <ChatInput
          onAsk={handleAsk}
          stage={chat.askStage}
          searchQuery={chat.searchQuery}
          disabled={screen !== "chat"}
          scrape={scrape}
        />
      </Stack>
    </Center>
  );
}
