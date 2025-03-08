import { prisma } from "../prisma";
import type { Message } from "libs/prisma";

export async function addMessage(threadId: string, message: Message) {
  return await prisma.thread.update({
    where: { id: threadId },
    data: { messages: { push: message as any } },
  });
}
