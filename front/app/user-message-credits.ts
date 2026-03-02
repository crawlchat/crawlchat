import { getBalance, getTotal } from "@packages/common/credit-transaction";
import { prisma } from "@packages/common/prisma";
import { PLAN_FREE, planMap } from "@packages/common/user-plan";

export async function getUserMessageCredits(userId: string) {
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    select: { plan: true },
  });

  const messageBalance = await getBalance(userId, "message");
  const messageTotal = await getTotal(
    userId,
    "message",
    1,
    user!.plan!.creditsResetAt!
  );

  if (user.plan?.credits?.messages === 0) {
    return { total: messageTotal, balance: messageBalance };
  }

  const plan = planMap[user.plan!.planId] ?? PLAN_FREE;

  return {
    total: plan.credits.messages,
    balance: user.plan?.credits?.messages ?? 0,
  };
}
