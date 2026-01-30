import { prisma } from "@packages/common/prisma";

export async function fetchDataGaps(scrapeId: string) {
  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      dataGap: {
        isNot: null,
      },
      OR: [
        {
          dataGap: {
            is: {
              status: null,
            },
          },
        },
        {
          dataGap: {
            is: {
              status: {
                isSet: false,
              },
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
