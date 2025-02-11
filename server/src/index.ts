import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Express, Request, Response } from "express";
import ws from "express-ws";
import { scrapeLoop, type ScrapeStore } from "./scrape/crawl";
import { OrderedSet } from "./scrape/ordered-set";
import cors from "cors";
import OpenAI from "openai";
import { askLLM, makeContext } from "./llm";
import { Stream } from "openai/streaming";
import mongoose from "mongoose";
import {
  createScrape,
  getScrapeByUrl,
  loadIndex,
  loadStore,
  saveIndex,
  saveStore,
  updateScrape,
} from "./scrape/store";
import { makeIndex } from "./vector";
import { addMessage, createThread, getThread } from "./thread/store";

const app: Express = express();
const expressWs = ws(app);
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

function makeMessage(type: string, data: any) {
  return JSON.stringify({ type, data });
}

function broadcast(message: string) {
  expressWs.getWss().clients.forEach((client) => {
    client.send(message);
  });
}

async function streamLLMResponse(
  ws: WebSocket,
  response: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
) {
  let content = "";
  let role: "developer" | "system" | "user" | "assistant" | "tool" = "user";
  for await (const chunk of response) {
    if (chunk.choices[0]?.delta?.content) {
      content += chunk.choices[0].delta.content;
      ws.send(
        makeMessage("llm-chunk", { content: chunk.choices[0].delta.content })
      );
    }
    if (chunk.choices[0]?.delta?.role) {
      role = chunk.choices[0].delta.role;
    }
  }
  return { content, role };
}

app.get("/", function (req: Request, res: Response) {
  res.json({ message: "ok" });
});

app.post("/scrape", async function (req: Request, res: Response) {
  const url = req.body.url;

  const existingScrape = await getScrapeByUrl(url);
  if (existingScrape) {
    res.status(212).json({ message: "already-scraped" });
    return;
  }

  (async function () {
    const scrape = await createScrape(url);

    const store: ScrapeStore = {
      urls: {},
      urlSet: new OrderedSet(),
    };
    store.urlSet.add(url);

    await updateScrape(scrape._id.toString(), {
      status: "scraping",
    });

    await scrapeLoop(store, req.body.url, {
      onPreScrape: async (url) => {
        broadcast(makeMessage("scrape-pre", { url }));
      },
      onComplete: async () => {
        broadcast(makeMessage("scrape-complete", { url }));
      },
    });

    await saveStore(scrape._id.toString(), store);

    const index = await makeIndex(store);
    await saveIndex(scrape._id.toString(), index);

    await updateScrape(scrape._id.toString(), {
      status: "done",
    });

    broadcast(makeMessage("saved", { url }));
  })();

  res.json({ message: "ok" });
});

expressWs.app.ws("/", function (ws, req) {
  ws.on("message", async function (msg) {
    const message = JSON.parse(msg.toString());

    if (message.type === "create-thread") {
      const thread = await createThread({ url: message.data.url });
      ws.send(makeMessage("thread-created", { threadId: thread.id }));
    }

    if (message.type === "ask-llm") {
      const threadId = message.data.threadId;
      const thread = await getThread(threadId);
      if (!thread || !thread.url) {
        ws.send(makeMessage("error", { message: "Thread not found" }));
        return;
      }

      const scrape = await getScrapeByUrl(thread.url);
      if (!scrape) {
        ws.send(makeMessage("error", { message: "Scrape not found" }));
        return;
      }

      const store = await loadStore(scrape._id.toString());
      const index = await loadIndex(scrape._id.toString());
      if (!store || !index) {
        ws.send(makeMessage("error", { message: "Store or index not found" }));
        return;
      }

      const response = await askLLM(message.data.query, thread.messages, {
        url: thread.url,
        context: await makeContext(message.data.query, index, store),
      });
      const { content, role } = await streamLLMResponse(ws as any, response);
      addMessage(threadId, { role, content } as any);
      ws.send(makeMessage("llm-chunk", { end: true, content, role }));
    }

    if (message.type === "sync-thread") {
      const threadId = message.data.threadId;
      const thread = await getThread(threadId);
      if (!thread) {
        ws.send(makeMessage("error", { message: "Thread not found" }));
        return;
      }
      ws.send(makeMessage("sync-thread", { thread }));
    }
  });
});

app.listen(port, async () => {
  await mongoose.connect(process.env.DATABASE_URL!);
  console.log(`Running on port ${port}`);
});
