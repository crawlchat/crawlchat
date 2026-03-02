import { getBalance, getTotal } from "@packages/common/credit-transaction";
import { prisma } from "@packages/common/prisma";

export async function getUserMessageCredits(userId: string) {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    select: { plan: true, createdAt: true },
  });

  const messageBalance = await getBalance(userId, "message");
  const messageTotal = await getTotal(
    userId,
    "message",
    1,
    user.plan?.creditsResetAt ?? user.plan?.activatedAt ?? user.createdAt
  );

  return { total: messageTotal, balance: messageBalance };
}
