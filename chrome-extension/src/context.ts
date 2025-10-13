import { createContext, useEffect, useState } from "react";
import { API_HOST, Config } from "./config";

export function usePopup() {
  const [config, setConfig] = useState<Config | null | undefined>();
  const [scrapes, setScrapes] = useState<
    {
      collectionId: string;
      collectionName: string;
      createdAt: Date;
    }[]
  >();

  useEffect(() => {
    chrome.storage.sync.get(["crawlchatConfig"], (result) => {
      setConfig(JSON.parse(result.crawlchatConfig || "{}") || null);
    });
  }, []);

  useEffect(() => {
    if (config) {
      chrome.storage.sync.set({ crawlchatConfig: JSON.stringify(config) });
    } else {
      chrome.storage.sync.remove(["crawlchatConfig"]);
    }
  }, [config]);

  useEffect(() => {
    if (config && config.apiKey) {
      fetchCollections(config.apiKey).then((scrapes) => {
        setScrapes(scrapes);
      });
    }
  }, [config]);

  async function fetchCollections(apiKey: string) {
    const response = await fetch(`${API_HOST}/collection`, {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  }

  return { config, setConfig, scrapes };
}

export const PopupContext = createContext({} as ReturnType<typeof usePopup>);
