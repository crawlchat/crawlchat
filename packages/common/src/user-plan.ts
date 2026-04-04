import type { UserPlan, UserPlanProvider } from "@prisma/client";
import { getBalance } from "./credit-transaction";
import { Plan, planMap } from "./plans";
import { prisma } from "./prisma";

export const activatePlan = async (
  userId: string,
  plan: Plan,
  {
    provider,
    subscriptionId,
    orderId,
    expiresAt,
    activatedAt,
  }: {
    provider: UserPlanProvider;
    subscriptionId?: string;
    activatedAt?: Date;
    orderId?: string;
    expiresAt?: Date;
  }
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: {
        planId: plan.id,
        provider,
        type: plan.type,
        subscriptionId,
        orderId,
        status: "ACTIVE",
        limits: plan.limits,
        expiresAt,
        activatedAt: activatedAt ?? new Date(),
        creditsResetAt: new Date(),
      },
    },
  });
};

export async function hasEnoughCredits(
  userId: string,
  type: "messages",
  options?: { amount?: number; alert?: { scrapeId: string; token: string } }
) {
  const amount = options?.amount ?? 1;

  const available = await getBalance(userId, "message");
  const has = available >= amount;

  if (options?.alert && (!has || available < 100)) {
    try {
      const response = await fetch(`${process.env.FRONT_URL}/email-alert`, {
        method: "POST",
        body: JSON.stringify({
          intent: "low-credits",
          scrapeId: options.alert.scrapeId,
          creditType: type,
          amount,
        }),
        headers: {
          Authorization: `Bearer ${options.alert.token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error from request. ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to send low credits alert", error);
    }
  }

  return has;
}

export async function isPaidPlan(userPlan: UserPlan) {
  const plan = planMap[userPlan.planId];

  if (
    ["SUBSCRIPTION", "ONE_TIME"].includes(plan.type) &&
    userPlan.status === "ACTIVE"
  ) {
    return true;
  }

  return false;
}

export async function getPagesCount(userId: string) {
  const scrapes = await prisma.scrape.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  const result = (await prisma.$runCommandRaw({
    aggregate: "ScrapeItem",
    pipeline: [
      {
        $match: {
          scrapeId: { $in: scrapes.map((s) => ({ $oid: s.id })) },
        },
      },
      {
        $project: {
          embeddingsCount: {
            $cond: {
              if: { $isArray: "$embeddings" },
              then: { $size: "$embeddings" },
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalEmbeddings: { $sum: "$embeddingsCount" },
        },
      },
    ],
    cursor: {},
  })) as any;

  return result.cursor?.firstBatch?.[0]?.totalEmbeddings || 0;
}
