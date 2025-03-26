import { createToken } from "~/jwt";
import type { Route } from "./+types/open-scrape";
import { prisma } from "~/prisma";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "scrape") {
    const url = formData.get("url") as string;
    const roomId = formData.get("roomId");

    if (!url) {
      return Response.json({ error: "URL is required" });
    }
    if (!roomId) {
      return Response.json({ error: "Room ID is required" });
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
      return { error: "Too many scrapes" };
    }

    const scrape = await prisma.scrape.create({
      data: {
        userId: process.env.OPEN_USER_ID!,
        url: url as string,
        status: "pending",
      },
    });

    const knowledgeGroup = await prisma.knowledgeGroup.create({
      data: {
        userId: process.env.OPEN_USER_ID!,
        title: "Default",
        type: "scrape_web",
        scrapeId: scrape.id,
        status: "pending",
        url,
      },
    });

    await fetch(`${process.env.VITE_SERVER_URL}/scrape`, {
      method: "POST",
      body: JSON.stringify({
        scrapeId: scrape.id,
        userId: scrape.userId,
        knowledgeGroupId: knowledgeGroup.id,
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

    return Response.json({
      token: createToken(roomId as string),
      scrapeId: scrape.id,
    });
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

    return Response.json({ llmTxt: text });
  }
}
