import type { Prisma, Scrape, User } from "@packages/common/prisma";
import { createContext, useEffect, useMemo, useState } from "react";
import type { BlogPost } from "~/blog/posts";
import { isEnabled } from "~/plan-check";
import type { SetupProgressAction } from "../setup-progress/config";

const CONVERSATIONS_DEFAULT_VIEW_KEY = "conversations-default-view";

export const useApp = ({
  user,
  scrapeUsers,
  scrapeId,
  scrape,
  latestChangelog,
  ownerPlanId,
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
  latestChangelog?: BlogPost;
  ownerPlanId?: string;
}) => {
  const [containerWidth, setContainerWidth] = useState<number>();
  const [progressActions, setProgressActions] = useState<SetupProgressAction[]>(
    []
  );
  const [closedReleaseKey, setClosedReleaseKey] = useState<string | null>();
  const [conversationsDefaultView, _setConversationsDefaultView] =
    useState<boolean>();
  const shouldUpgrade = useMemo(() => {
    if (user.plan?.subscriptionId) {
      return false;
    }
    return !scrapeUsers.find((su) => su.scrape.user.plan?.subscriptionId);
  }, [scrapeUsers]);

  useEffect(() => {
    const defaultView = localStorage.getItem(CONVERSATIONS_DEFAULT_VIEW_KEY);
    _setConversationsDefaultView(defaultView === "true");
  }, []);

  useEffect(() => {
    const key = localStorage.getItem("closedReleaseKey");
    setClosedReleaseKey(key ?? null);
  }, []);

  useEffect(() => {
    if (closedReleaseKey) {
      localStorage.setItem("closedReleaseKey", closedReleaseKey);
    }
  }, [closedReleaseKey]);

  function setConversationsDefaultView(value: boolean) {
    localStorage.setItem(
      CONVERSATIONS_DEFAULT_VIEW_KEY,
      value ? "true" : "false"
    );
    _setConversationsDefaultView(value);
  }

  function isScrapeFeatureEnabled(fromPlanId: string) {
    if (ownerPlanId) {
      return isEnabled(fromPlanId, ownerPlanId);
    }
  }

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
    latestChangelog,
    conversationsDefaultView,
    setConversationsDefaultView,
    isScrapeFeatureEnabled,
  };
};

export const AppContext = createContext({} as ReturnType<typeof useApp>);
