import type { Scrape, User } from "libs/prisma";
import { createContext, useEffect, useState } from "react";
import type { SetupProgressAction } from "./setup-progress";

export const useApp = ({
  user,
  scrapeId,
  scrape,
}: {
  user: User;
  scrapeId?: string;
  scrape?: Scrape;
}) => {
  const [containerWidth, setContainerWidth] = useState<number>();
  const [progressActions, setProgressActions] = useState<SetupProgressAction[]>(
    []
  );
  const [closedReleaseKey, setClosedReleaseKey] = useState<string | null>();

  useEffect(() => {
    const key = localStorage.getItem("closedReleaseKey");
    setClosedReleaseKey(key ?? null);
  }, []);

  useEffect(() => {
    if (closedReleaseKey) {
      localStorage.setItem("closedReleaseKey", closedReleaseKey);
    }
  }, [closedReleaseKey]);

  return {
    user,
    containerWidth,
    setContainerWidth,
    scrapeId,
    progressActions,
    setProgressActions,
    scrape,
    closedReleaseKey,
    setClosedReleaseKey,
  };
};

export const AppContext = createContext({} as ReturnType<typeof useApp>);
