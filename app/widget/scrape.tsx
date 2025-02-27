import { prisma } from "~/prisma";
import type { Route } from "./+types/scrape";
import { Group, Link, Stack, Text } from "@chakra-ui/react";
import { createToken } from "~/jwt";
import "highlight.js/styles/vs.css";
import ChatBox from "~/dashboard/chat-box";
import { commitSession, getSession } from "~/session";
import { data, redirect } from "react-router";
import { useEffect } from "react";

export async function loader({ params, request }: Route.LoaderArgs) {
  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id },
  });

  if (!scrape) {
    return redirect("/");
  }

  const session = await getSession(request.headers.get("cookie"));
  const chatSessionKeys = session.get("chatSessionKeys") ?? {};

  if (!chatSessionKeys[scrape.id]) {
    const thread = await prisma.thread.create({
      data: {
        scrapeId: scrape.id,
      },
    });
    chatSessionKeys[scrape.id] = thread.id;
  }

  session.set("chatSessionKeys", chatSessionKeys);

  const userToken = await createToken(chatSessionKeys[scrape.id]);

  const thread = await prisma.thread.update({
    where: { id: chatSessionKeys[scrape.id] },
    data: {
      openedAt: new Date(),
    },
  });
  return data(
    {
      scrape,
      userToken,
      thread,
      embed: new URL(request.url).searchParams.get("embed") === "true",
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: data.scrape.title ?? data.scrape.url,
    },
  ];
}

export default function ScrapeWidget({ loaderData }: Route.ComponentProps) {
  useEffect(() => {
    if (loaderData.embed) {
      document.documentElement.style.background = "transparent";
    }
  }, [loaderData.embed]);

  function handleClose() {
    if (loaderData.embed) {
      window.parent.postMessage("close", "*");
    }
  }

  return (
    <Stack
      h="100dvh"
      bg={loaderData.embed ? "blackAlpha.700" : "brand.gray.100"}
    >
      <ChatBox
        thread={loaderData.thread}
        scrape={loaderData.scrape!}
        userToken={loaderData.userToken}
        key={loaderData.thread.id}
        onBgClick={handleClose}
      />
    </Stack>
  );
}
