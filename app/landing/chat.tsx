import {
  Center,
  Group,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { TbSend } from "react-icons/tb";
import Markdown from "react-markdown";
import { Prose } from "~/components/ui/prose";
import type { Route } from "./+types/chat";
import { redirect } from "react-router";

function makeMessage(type: string, data: any) {
  return JSON.stringify({ type, data });
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url) {
    throw redirect("/");
  }

  return { url };
}

export default function Chat({ loaderData }: Route.ComponentProps) {
  const socket = useRef<WebSocket>(null);
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [threadId, setThreadId] = useState<string>();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:3000");
    socket.current.onopen = () => {
      socket.current!.send(
        makeMessage("create-thread", {
          url: loaderData.url,
        })
      );
    };
    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "llm-chunk") {
        if (message.data.end) {
          setMessages((prev) => [
            ...prev,
            { role: message.data.role, content: message.data.content },
          ]);
          setContent("");
          return;
        }
        setContent((prev) => prev + message.data.content);
      }
      if (message.type === "thread-created") {
        setThreadId(message.data.threadId);
      }
    };
  }, []);

  function handleAsk() {
    socket.current!.send(makeMessage("ask-llm", { threadId, query }));
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setQuery("");
  }

  return (
    <Center py={8}>
      <Stack w={"500px"}>
        <Text>
          {threadId?.substring(0, 8)} - {loaderData.url}
        </Text>

        <Stack maxH={"500px"} overflowY={"auto"}>
          {[
            ...messages,
            ...(content ? [{ role: "assistant", content }] : []),
          ].map((message, index) => (
            <Stack key={index} bg="brand.outline" p={4} borderRadius={4}>
              <Text>{message.role}</Text>
              <Prose>
                <Markdown>{message.content}</Markdown>
              </Prose>
            </Stack>
          ))}
        </Stack>

        <Group>
          <Input
            placeholder="Ask your query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconButton onClick={handleAsk}>
            <TbSend />
          </IconButton>
        </Group>
      </Stack>
    </Center>
  );
}
