import type { PlanType, UserPlanProvider } from "@prisma/client";
import { prisma } from "~/prisma";

type PlanResetType = "monthly" | "yearly" | "one-time" | "on-payment";
type PlanCategory = "BASE" | "SERVICE" | "TOPUP";

export type Plan = {
  id: string;
  name: string;
  price: number;
  type: PlanType;
  category: PlanCategory;
  credits: number;
  resetType: PlanResetType;
};

export const PLAN_FREE: Plan = {
  id: "free",
  name: "Free",
  price: 0,
  type: "ONE_TIME",
  credits: 10,
  resetType: "one-time",
  category: "BASE",
};

export const PLAN_LTD: Plan = {
  id: "saas",
  name: "SaaS Kit",
  price: 89,
  type: "ONE_TIME",
  credits: 100,
  resetType: "monthly",
  category: "BASE",
};

export const PLAN_REMOTION: Plan = {
  id: "remotion",
  name: "Remotion Kit",
  price: 147,
  type: "ONE_TIME",
  credits: 100,
  resetType: "monthly",
  category: "BASE",
};

export const PLAN_MONTHLY: Plan = {
  id: "monthly",
  name: "Monthly",
  price: 9,
  type: "SUBSCRIPTION",
  credits: 100,
  resetType: "on-payment",
  category: "BASE",
};

export const PLAN_TOPUP: Plan = {
  id: "topup",
  name: "Topup",
  price: 10,
  type: "ONE_TIME",
  credits: 100,
  resetType: "one-time",
  category: "TOPUP",
};

export const planMap: Record<string, Plan> = {
  [PLAN_FREE.id]: PLAN_FREE,
  [PLAN_LTD.id]: PLAN_LTD,
  [PLAN_MONTHLY.id]: PLAN_MONTHLY,
  [PLAN_TOPUP.id]: PLAN_TOPUP,
};

export const activatePlan = async (
  userId: string,
  plan: Plan,
  {
    provider,
    subscriptionId,
    orderId,
    expiresAt,
  }: {
    provider?: UserPlanProvider;
    subscriptionId?: string;
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
        credits: plan.credits,
        expiresAt,
        activatedAt: new Date(),
      },
    },
  });
};

export const consumeCredits = async (userId: string, amount: number) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: {
        upsert: {
          set: {
            credits: PLAN_FREE.credits,
            planId: PLAN_FREE.id,
            type: PLAN_FREE.type,
          },
          update: { credits: { decrement: amount } },
        },
      },
    },
  });
};

export const resetCredits = async (userId: string, planId?: string) => {
  const plan = planMap[planId ?? PLAN_FREE.id];

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: {
        upsert: {
          set: { credits: plan.credits, planId: plan.id, type: plan.type },
          update: { credits: plan.credits },
        },
      },
    },
  });
};

export const addTopup = async (
  userId: string,
  plan: Plan,
  {
    provider,
    orderId,
  }: {
    provider?: UserPlanProvider;
    orderId?: string;
  }
) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      topups: {
        push: {
          planId: plan.id,
          credits: plan.credits,
          orderId,
          createdAt: new Date(),
          provider,
        },
      },
    },
  });
};