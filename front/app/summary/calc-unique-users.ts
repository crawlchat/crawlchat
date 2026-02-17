import type { Location, MessageChannel } from "@packages/common/prisma";
import type { UniqueUser } from "./unique-users";

type MessageForUniqueUser = {
  createdAt: Date;
  fingerprint: string | null;
  channel: MessageChannel | null;
  llmMessage: { role?: string | null; content?: unknown } | null;
  thread: { location: Location | null };
};

export function calcUniqueUsers(messages: MessageForUniqueUser[]): UniqueUser[] {
  const usersMap = new Map<string, UniqueUser>();

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

  return Array.from(usersMap.values())
    .sort((a, b) => b.lastAsked.getTime() - a.lastAsked.getTime());
}
