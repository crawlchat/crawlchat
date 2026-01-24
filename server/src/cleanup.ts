import { prisma } from "@packages/common/prisma";

function chunk<T>(array: T[], size: number): T[][] {
  return array.reduce((acc, _, i) => {
    const index = Math.floor(i / size);
    acc[index] = [...(acc[index] || []), array[i]];
    return acc;
  }, [] as T[][]);
}

export async function cleanupMessages() {
  const TWO_MONTHS_AGO = new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000);
  const messages = await prisma.message.findMany({
    where: {
      createdAt: {
        lt: TWO_MONTHS_AGO,
      },
    },
    select: {
      id: true,
      thread: true,
    },
  });

  console.log("Found", messages.length, "messages");

  for (const msgsChunk of chunk(messages, 100)) {
    const filteredIds = msgsChunk
      .filter((m) => !m.thread.ticketKey)
      .map((m) => m.id);
    console.log("Deleting chunk", filteredIds.length, "messages");
    await prisma.message.deleteMany({
      where: {
        id: {
          in: filteredIds,
        },
      },
    });
  }
}
