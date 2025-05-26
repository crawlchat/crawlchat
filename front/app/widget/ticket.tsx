import { prisma } from "libs/prisma";
import type { Scrape } from "libs/prisma";
import type { Route } from "./+types/ticket";
import { Group, Image, Link, Stack, Text } from "@chakra-ui/react";
import { TbAlertCircle } from "react-icons/tb";
import { RiChatVoiceAiFill } from "react-icons/ri";

export async function loader({ params }: Route.LoaderArgs) {
  const { id } = params;
  const thread = await prisma.thread.findFirst({
    where: {
      id,
    },
    include: {
      messages: true,
      scrape: true,
    },
  });
  return { thread };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    {
      title: "CrawlChat",
    },
  ];
}

function Nav({ scrape }: { scrape: Scrape }) {
  return (
    <Stack
      as="nav"
      p={4}
      borderBottom={"1px solid"}
      borderColor={"brand.outline"}
    >
      <Group justifyContent={"space-between"}>
        <Group>
          {scrape.logoUrl && (
            <Image
              src={scrape.logoUrl}
              alt={scrape.title ?? ""}
              maxH={"18px"}
            />
          )}
          <Text fontSize={"lg"} fontWeight={"bold"}>
            {scrape.title}
          </Text>
        </Group>
        <Text
          fontSize={"sm"}
          opacity={0.5}
          display={"flex"}
          alignItems={"center"}
          gap={2}
        >
          Powered by{" "}
          <Link href="https://crawlchat.com" fontWeight={"bold"}>
            <RiChatVoiceAiFill />
            CrawlChat
          </Link>
        </Text>
      </Group>
    </Stack>
  );
}

export default function Ticket({ loaderData }: Route.ComponentProps) {
  if (!loaderData.thread) {
    return (
      <Stack alignItems={"center"} justifyContent={"center"} h="100vh" w="full">
        <TbAlertCircle size={48} />
        <Text>Ticket not found</Text>
      </Stack>
    );
  }
  return (
    <Stack alignItems={"center"}>
      <Stack maxW={800} w="full">
        <Nav scrape={loaderData.thread.scrape} />
        <Stack gap={0}>
          {/* {loaderData.thread.messages.map((message, idx) => (
            <Message
              key={message.id}
              message={message}
              last={idx === loaderData.thread!.messages.length - 1}
            />
          ))} */}
        </Stack>
      </Stack>
    </Stack>
  );
}
