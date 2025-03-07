import { useEffect, useRef, useState } from "react";
import { makeMessage } from "./socket-util";
import { toaster } from "~/components/ui/toaster";
import type { FetcherWithComponents } from "react-router";

export function useScrape() {
  const socket = useRef<WebSocket>(null);
  const [stage, setStage] = useState<"idle" | "scraping" | "scraped" | "saved">(
    "idle"
  );
  const [scraping, setScraping] = useState<{
    url: string;
    remainingCount: number;
    scrapedCount: number;
    markdown?: string;
  }>();

  function connect(token: string) {
    socket.current = new WebSocket(import.meta.env.VITE_SERVER_WS_URL);
    socket.current.onopen = () => {
      socket.current?.send(
        makeMessage("join-room", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
    };
    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "scrape-start") {
        setStage("scraping");
      }

      if (message.type === "scrape-pre") {
        setScraping({
          url: message.data.url,
          remainingCount: message.data.remainingUrlCount,
          scrapedCount: message.data.scrapedUrlCount,
          markdown: message.data.markdown,
        });
        setStage("scraping");
      }

      if (message.type === "scrape-complete") {
        setStage("scraped");
      }

      if (message.type === "saved") {
        setStage("saved");
      }

      if (message.type === "error") {
        toaster.error({
          title: "Failed to connect",
          description: message.data.message,
        });
      }
    };
  }

  return {
    connect,
    stage,
    scraping,
  };
}
