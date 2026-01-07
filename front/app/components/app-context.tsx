import type { Prisma, Scrape, ScrapeUser, User } from "libs/prisma";
import { createContext, useEffect, useMemo, useState } from "react";
import type { SetupProgressAction } from "../setup-progress/config";

export const useApp = ({
  user,
  scrapeUsers,
  scrapeId,
  scrape,
}: {
  user: User;
  scrapeUsers: Prisma.ScrapeUserGetPayload<{
    include: {
      scrape: {
        include: {
          user: true;
        };
      };
    };
  }>[];
  scrapeId?: string;
  scrape?: Scrape;
}) => {
  const [containerWidth, setContainerWidth] = useState<number>();
  const [progressActions, setProgressActions] = useState<SetupProgressAction[]>(
    []
  );
  const [closedReleaseKey, setClosedReleaseKey] = useState<string | null>();
  const shouldUpgrade = useMemo(() => {
    if (user.plan?.subscriptionId) {
      return false;
    }
    return !scrapeUsers.find((su) => su.scrape.user.plan?.subscriptionId);
  }, [scrapeUsers]);

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
    shouldUpgrade,
  };
};

export const AppContext = createContext({} as ReturnType<typeof useApp>);
