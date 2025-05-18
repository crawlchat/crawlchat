import type { KnowledgeGroupUpdateFrequency } from "./prisma";

export function getNextUpdateTime(
  frequency: KnowledgeGroupUpdateFrequency | null,
  lastUpdatedAt: Date | null
) {
  const DAY = 24 * 60 * 60 * 1000;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;

  if (!lastUpdatedAt) {
    lastUpdatedAt = new Date();
  }

  if (frequency === "daily") {
    return new Date(lastUpdatedAt.getTime() + DAY);
  }

  if (frequency === "weekly") {
    return new Date(lastUpdatedAt.getTime() + WEEK);
  }

  if (frequency === "monthly") {
    return new Date(lastUpdatedAt.getTime() + MONTH);
  }

  return null;
}
