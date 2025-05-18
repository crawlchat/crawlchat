import type { KnowledgeGroupUpdateFrequency } from "./prisma";

export function getNextUpdateTime(
  frequency: KnowledgeGroupUpdateFrequency | null,
  lastUpdatedAt: Date | null
) {
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const WEEK = 7 * DAY;
  const MONTH = 30 * DAY;

  if (!lastUpdatedAt) {
    lastUpdatedAt = new Date();
  }

  if (frequency === "minutely") {
    return new Date(lastUpdatedAt.getTime() + 60 * 1000);
  }

  if (frequency === "hourly") {
    return new Date(lastUpdatedAt.getTime() + 60 * 60 * 1000);
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
