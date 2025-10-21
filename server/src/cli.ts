import dotenv from "dotenv";
dotenv.config();
import { prisma } from "libs/prisma";
import fs from "fs";

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

}

console.log("Starting...");
main();
