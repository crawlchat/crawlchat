import dotenv from "dotenv";
dotenv.config();
import { prisma } from "libs/prisma";
import fs from "fs";
import { getPagesCount, planMap } from "libs/user-plan";

async function clearDataGaps() {
  const dataGapMessages = await prisma.message.findMany({
    where: {
      NOT: {
        analysis: {
          dataGapTitle: null,
        },
      },
    },
  });

  const messages = dataGapMessages.filter(
    (m) =>
      m.analysis?.dataGapTitle &&
      m.analysis?.dataGapDescription &&
      !m.analysis?.dataGapDone
  );

  for (const message of messages) {
    console.log("Updating message", message.id);
    await prisma.message.update({
      where: { id: message.id },
      data: { analysis: { dataGapTitle: null, dataGapDescription: null } },
    });
  }
}

async function saveUsersCsv() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
    where: {
      createdAt: {
        gte: new Date("2025-08-01"),
      },
    },
  });

  const text = `email\n${users.map((user) => user.email).join("\n")}`;
  fs.writeFileSync("users.csv", text);
}

async function main() {
  const users = await prisma.user.findMany({});

  for (const user of users) {
    const plan = planMap[user.plan?.planId ?? "free"];
    console.log("Updating user", user.email, plan.id);
    if (user.plan) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: {
            ...user.plan,
            limits: plan.limits,
          },
        },
      });
    }
  }
}

console.log("Starting...");
main();
