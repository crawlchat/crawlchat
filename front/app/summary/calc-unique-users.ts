import type { Location, MessageChannel } from "@packages/common/prisma";
import type { UniqueUser } from "./unique-users";

type MessageForUniqueUser = {
  createdAt: Date;
  fingerprint: string | null;
  channel: MessageChannel | null;
  llmMessage: { role?: string | null; content?: unknown } | null;
  thread: { location: Location | null };
};

type UserAcc = Omit<UniqueUser, "ageDays">;

export function calcUniqueUsers(
  messages: MessageForUniqueUser[]
): UniqueUser[] {
  const usersMap = new Map<string, UserAcc>();

  for (const message of messages) {
    const fp = message.fingerprint;
    if (!fp || (message.llmMessage as any)?.role !== "user") continue;

    const existing = usersMap.get(fp);

    if (existing) {
      existing.questionsCount++;
      if (message.createdAt < existing.firstAsked) {
        existing.firstAsked = message.createdAt;
        existing.channel = message.channel;
      }
      if (message.createdAt > existing.lastAsked) {
        existing.lastAsked = message.createdAt;
      }
      if (!existing.location && message.thread.location) {
        existing.location = message.thread.location;
      }
    } else {
      usersMap.set(fp, {
        fingerprint: fp,
        questionsCount: 1,
        firstAsked: message.createdAt,
        lastAsked: message.createdAt,
        channel: message.channel,
        location: message.thread.location,
      });
    }
  }

  const DAY_MS = 1000 * 60 * 60 * 24;

  return Array.from(usersMap.values())
    .map((u) => ({
      ...u,
      ageDays: Math.ceil(
        (u.lastAsked.getTime() - u.firstAsked.getTime()) / DAY_MS
      ),
    }))
    .sort((a, b) => b.ageDays - a.ageDays);
}
