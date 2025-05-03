import WeeklyEmail from "../../emails/weekly";
import { analysePairMessages, makeMessagePairs } from "~/message/analyse";
import { sendReactEmail } from "~/email";
import { prisma } from "~/prisma";

export async function sendWeeklyForUser(userId: string, email: string) {
  const ONE_WEEK_AGO = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const messages = await prisma.message.findMany({
    where: {
      ownerUserId: userId,
      createdAt: {
        gte: ONE_WEEK_AGO,
      },
    },
    include: {
      thread: true,
    },
  });

  const pairs = makeMessagePairs(messages);
  const { performance, defaultPairs } = analysePairMessages(pairs);

  await sendReactEmail(
    email,
    "Weekly Report",
    <WeeklyEmail
      messages={pairs.length}
      MCPHits={defaultPairs.length}
      performance={performance}
    />
  );
}

export async function sendWeeklyForAllUsers() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    const scrapes = await prisma.scrape.count({
      where: {
        userId: user.id,
      },
    });
    if (scrapes === 0) {
      console.log(`Skipping ${user.email} because they have no scrapes`);
      continue;
    }
    if (user.settings?.weeklyUpdates === false) {
      console.log(
        `Skipping ${user.email} because they have weekly updates disabled`
      );
      continue;
    }
    console.log(`Sending weekly report to ${user.email}`);
    await sendWeeklyForUser(user.id, user.email);
  }
}
