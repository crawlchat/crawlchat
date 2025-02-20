import { prisma } from "~/prisma";
import type { Route } from "./+types/scrape";
import { Stack } from "@chakra-ui/react";
import { createToken } from "~/jwt";
import "highlight.js/styles/vs.css";
import ChatBox from "~/dashboard/chat-box";

export async function loader({ params }: Route.LoaderArgs) {
  const scrape = await prisma.scrape.findUnique({
    where: { id: params.id },
  });
  const userToken = await createToken("6790c3cc84f4e51db33779c5");
  const thread = await prisma.thread.findFirstOrThrow({
    where: { id: "67b5e7b57222da88524d7daf" },
  });
  return { scrape, userToken, thread };
}

export default function ScrapeWidget({ loaderData }: Route.ComponentProps) {
  return (
    <Stack h="100dvh" bg="brand.gray.100" p={4}>
      <ChatBox
        thread={loaderData.thread}
        scrape={loaderData.scrape!}
        userToken={loaderData.userToken}
        key={loaderData.thread.id}
      />
    </Stack>
  );
}
