import { prisma } from "libs/prisma";

export async function fetchDataGaps(scrapeId: string) {
  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      AND: [
        {
          analysis: {
            isNot: {
              dataGapTitle: null,
            },
          },
        },
        {
          analysis: {
            isNot: {
              dataGapDone: true,
            },
          },
        },
      ],
      createdAt: {
        gte: ONE_WEEK_AGO,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return messages;
}
