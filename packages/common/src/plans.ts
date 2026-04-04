import type { PlanLimits, PlanType } from "@prisma/client";

type PlanResetType = "monthly" | "yearly" | "one-time" | "on-payment";
type PlanCategory = "BASE" | "SERVICE" | "TOPUP";

export type Plan = {
  id: string;
  name: string;
  price: number;
  type: PlanType;
  category: PlanCategory;
  credits: {
    messages: number;
  };
  resetType: PlanResetType;
  limits: PlanLimits;
  supportsAnalysis: boolean;
  description?: string;
  popular?: boolean;
};

export const PLAN_FREE: Plan = {
  id: "free",
  name: "Free",
  price: 0,
  type: "ONE_TIME",
  credits: {
    messages: 20,
  },
  limits: {
    scrapes: 1,
    teamMembers: 1,
    pages: 40,
  },
  resetType: "one-time",
  category: "BASE",
  supportsAnalysis: false,
};

export const PLAN_HOBBY: Plan = {
  id: "hobby",
  name: "Hobby",
  price: 21,
  type: "SUBSCRIPTION",
  credits: {
    messages: 800,
  },
  limits: {
    scrapes: 1,
    teamMembers: 1,
    pages: 2000,
  },
  resetType: "monthly",
  category: "BASE",
  supportsAnalysis: false,
};

export const PLAN_STARTER: Plan = {
  id: "starter",
  name: "Starter",
  price: 45,
  type: "SUBSCRIPTION",
  credits: {
    messages: 2000,
  },
  limits: {
    scrapes: 2,
    teamMembers: 2,
    pages: 5000,
  },
  resetType: "monthly",
  category: "BASE",
  supportsAnalysis: true,
};

export const PLAN_PRO: Plan = {
  id: "pro",
  name: "Pro",
  price: 99,
  type: "SUBSCRIPTION",
  credits: {
    messages: 7000,
  },
  limits: {
    scrapes: 3,
    teamMembers: 5,
    pages: 14000,
  },
  resetType: "monthly",
  category: "BASE",
  supportsAnalysis: true,
};

export const PLAN_STARTER_YEARLY: Plan = {
  id: "starter-yearly",
  name: "Starter",
  price: 450,
  type: "SUBSCRIPTION",
  credits: {
    messages: 2000 * 12,
  },
  limits: {
    scrapes: 2,
    teamMembers: 2,
    pages: 5000,
  },
  resetType: "yearly",
  category: "BASE",
  supportsAnalysis: true,
};

export const PLAN_PRO_YEARLY: Plan = {
  id: "pro-yearly",
  name: "Pro",
  price: 990,
  type: "SUBSCRIPTION",
  credits: {
    messages: 7000 * 12,
  },
  limits: {
    scrapes: 3,
    teamMembers: 5,
    pages: 14000,
  },
  resetType: "yearly",
  category: "BASE",
  supportsAnalysis: true,
};

export const PLAN_HOBBY_YEARLY: Plan = {
  id: "hobby-yearly",
  name: "Hobby",
  price: 210,
  type: "SUBSCRIPTION",
  credits: {
    messages: 800 * 12,
  },
  limits: {
    scrapes: 1,
    teamMembers: 1,
    pages: 2000,
  },
  resetType: "yearly",
  category: "BASE",
  supportsAnalysis: false,
};

export const PLAN_LAUNCH: Plan = {
  id: "launch",
  name: "Launch",
  price: 29,
  type: "SUBSCRIPTION",
  credits: {
    messages: 800,
  },
  limits: {
    scrapes: 1,
    teamMembers: 1,
    pages: 2000,
  },
  resetType: "monthly",
  category: "BASE",
  description: "Get started with CrawlChat",
  supportsAnalysis: false,
};

export const PLAN_LAUNCH_YEARLY: Plan = {
  id: "launch-yearly",
  name: "Launch",
  price: 290,
  type: "SUBSCRIPTION",
  credits: {
    messages: 800 * 12,
  },
  limits: {
    scrapes: 1,
    teamMembers: 1,
    pages: 2000,
  },
  resetType: "yearly",
  category: "BASE",
  description: "Get started with CrawlChat",
  supportsAnalysis: false,
};

export const PLAN_GROW: Plan = {
  id: "grow",
  name: "Grow",
  price: 69,
  type: "SUBSCRIPTION",
  credits: {
    messages: 2000,
  },
  limits: {
    scrapes: 2,
    teamMembers: 2,
    pages: 5000,
  },
  resetType: "monthly",
  category: "BASE",
  description: "For growing teams and projects",
  popular: true,
  supportsAnalysis: true,
};

export const PLAN_GROW_YEARLY: Plan = {
  id: "grow-yearly",
  name: "Grow",
  price: 690,
  type: "SUBSCRIPTION",
  credits: {
    messages: 2000 * 12,
  },
  limits: {
    scrapes: 2,
    teamMembers: 2,
    pages: 5000,
  },
  resetType: "yearly",
  category: "BASE",
  description: "For growing teams and projects",
  popular: true,
  supportsAnalysis: true,
};

export const PLAN_ACCELERATE: Plan = {
  id: "accelerate",
  name: "Accelerate",
  price: 229,
  type: "SUBSCRIPTION",
  credits: {
    messages: 7000,
  },
  limits: {
    scrapes: 3,
    teamMembers: 5,
    pages: 14000,
  },
  resetType: "monthly",
  category: "BASE",
  description: "For teams that need more power",
  supportsAnalysis: true,
};

export const PLAN_ACCELERATE_YEARLY: Plan = {
  id: "accelerate-yearly",
  name: "Accelerate",
  price: 2290,
  type: "SUBSCRIPTION",
  credits: {
    messages: 7000 * 12,
  },
  limits: {
    scrapes: 3,
    teamMembers: 5,
    pages: 14000,
  },
  resetType: "yearly",
  category: "BASE",
  description: "For teams that need more power",
  supportsAnalysis: true,
};

export const planMap: Record<string, Plan> = {
  [PLAN_FREE.id]: PLAN_FREE,
  [PLAN_STARTER.id]: PLAN_STARTER,
  [PLAN_PRO.id]: PLAN_PRO,
  [PLAN_HOBBY.id]: PLAN_HOBBY,
  [PLAN_STARTER_YEARLY.id]: PLAN_STARTER_YEARLY,
  [PLAN_PRO_YEARLY.id]: PLAN_PRO_YEARLY,
  [PLAN_HOBBY_YEARLY.id]: PLAN_HOBBY_YEARLY,

  [PLAN_LAUNCH.id]: PLAN_LAUNCH,
  [PLAN_LAUNCH_YEARLY.id]: PLAN_LAUNCH_YEARLY,
  [PLAN_GROW.id]: PLAN_GROW,
  [PLAN_GROW_YEARLY.id]: PLAN_GROW_YEARLY,
  [PLAN_ACCELERATE.id]: PLAN_ACCELERATE,
  [PLAN_ACCELERATE_YEARLY.id]: PLAN_ACCELERATE_YEARLY,
};

export const allActivePlans: Plan[] = [
  PLAN_LAUNCH,
  PLAN_LAUNCH_YEARLY,
  PLAN_GROW,
  PLAN_GROW_YEARLY,
  PLAN_ACCELERATE,
  PLAN_ACCELERATE_YEARLY,
];

export const topupPlans = [
  {
    id: "1000",
    credits: 1000,
    price: 18,
    description: "Best when billing cycle is just a week away.",
  },
  {
    id: "3000",
    credits: 3000,
    price: 52,
    description: "Best when billing cycle is a couple of weeks away.",
  },
  {
    id: "5000",
    credits: 5000,
    price: 84,
    description: "Best when you exhausted the credits in first week.",
  },
];
