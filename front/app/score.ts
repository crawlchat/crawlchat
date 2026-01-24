import type { Message } from "@packages/common/prisma";

export function getMessagesScore(messages: Message[]) {
  const scores = messages.map((m) => {
    return Math.max(...Object.values(m.links).map((l) => l?.score ?? 0), 0);
  });
  return scores.reduce((a, b) => a + b, 0) / (scores.length / 2);
}
