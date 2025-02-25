import { useState, useEffect } from "react";
import { Box, Heading, Text, Stack, Input, Group } from "@chakra-ui/react";
import { TbFileText, TbDownload } from "react-icons/tb";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/llm-txt";
import { prisma } from "~/prisma";
import { createToken } from "~/jwt";
import { useScrape } from "~/dashboard/use-scrape";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "scrape") {
    const url = formData.get("url");
    const roomId = formData.get("roomId");

    if (!url) {
      return { error: "URL is required" };
    }
    if (!roomId) {
      return { error: "Room ID is required" };
    }

    const lastMinute = new Date(Date.now() - 60 * 1000);

    const scrapes = await prisma.scrape.findMany({
      where: {
        userId: process.env.OPEN_USER_ID!,
        createdAt: {
          gt: lastMinute,
        },
      },
    });

    if (scrapes.length >= 5) {
      console.log("Too many scrapes");
      return { error: "Too many scrapes" };
    }

    const scrape = await prisma.scrape.create({
      data: {
        userId: process.env.OPEN_USER_ID!,
        url: url as string,
        status: "pending",
      },
    });

    await fetch(`${process.env.VITE_SERVER_URL}/scrape`, {
      method: "POST",
      body: JSON.stringify({
        scrapeId: scrape.id,
        userId: scrape.userId,
        url,
        maxLinks: 1,
        roomId: `user-${roomId}`,
        includeMarkdown: true,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${createToken(process.env.OPEN_USER_ID!)}`,
      },
    });

    return { token: createToken(roomId as string), scrapeId: scrape.id };
  }

  if (intent === "llm.txt") {
    const scrapeId = formData.get("scrapeId");
    const res = await fetch(
      `${process.env.VITE_SERVER_URL}/llm.txt?scrapeId=${scrapeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${createToken(process.env.OPEN_USER_ID!)}`,
        },
      }
    );
    const { text } = await res.json();

    return { llmTxt: text };
  }
}

export default function LLMTxt() {
  const fetcher = useFetcher();
  const { connect, scraping, stage } = useScrape();
  const [roomId, setRoomId] = useState<string>("");

  useEffect(function connectScrape() {
    if (fetcher.data?.token) {
      connect(fetcher.data.token);
    }
  }, [fetcher.data?.token]);

  useEffect(() => {
    const getRandomRoomId = () => {
      return Math.random().toString(36).substring(2, 15);
    };
    if (!localStorage.getItem("roomId")) {
      localStorage.setItem("roomId", getRandomRoomId());
    }
    setRoomId(localStorage.getItem("roomId")!);
  }, []);

  return (
    <Box maxW="container.xl" mx="auto" py={10} px={4}>
      <Stack gap={8}>
        <Box textAlign="center">
          <Heading
            size="xl"
            mb={4}
            bgGradient="linear(to-r, purple.600, purple.400)"
            bgClip="text"
          >
            LLM.txt File Generator
          </Heading>
          <Text fontSize="lg">
            Generate an LLM.txt file from a website URL or existing Scrape ID
          </Text>
        </Box>

        <Stack gap={6}>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="scrape" />
            <input type="hidden" name="roomId" value={roomId} />
            <Stack gap={6}>
              <Box>
                <Text mb={2} fontWeight="medium">
                  Website URL
                </Text>
                <Input
                  name="url"
                  placeholder="Ex: https://example.com"
                  size="lg"
                  type="url"
                />
              </Box>

              {fetcher.data?.error && (
                <Box p={3} bg="red.50" color="red.700" borderRadius="md">
                  {fetcher.data.error}
                </Box>
              )}

              <Group justifyContent="center">
                <Button
                  size="lg"
                  loading={fetcher.state !== "idle"}
                  type="submit"
                >
                  <TbFileText />
                  <span>Scrape URL & Generate LLM.txt</span>
                  <TbDownload />
                </Button>
              </Group>
            </Stack>
          </fetcher.Form>
        </Stack>

        <Box bg="brand.subtle" p={6} borderRadius="md">
          <Heading size="md" mb={4} color="brand.fg">
            What is LLM.txt?
          </Heading>
          <Text>
            LLM.txt is a specially formatted text file that contains the scraped
            content from a website in a format that's optimized for Large
            Language Models. This file can be used for training, fine-tuning, or
            as context for AI models to better understand the content of a
            specific website.
          </Text>
        </Box>
      </Stack>
    </Box>
  );
}
