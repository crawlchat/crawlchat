import type { Message } from "libs/prisma";

export function getScoreColor(score: number) {
  if (score < 0.25) {
    return "red";
  }
  if (score < 0.5) {
    return "orange";
  }
  if (score < 0.75) {
    return "blue";
  }
  return "brand";
}

export function getMessagesScore(messages: Message[]) {
  const scores = messages.map((m) => {
    return Math.max(...Object.values(m.links).map((l) => l?.score ?? 0), 0);
  });
  return scores.reduce((a, b) => a + b, 0) / (scores.length / 2);
}
