import {
  PLAN_ACCELERATE,
  PLAN_ACCELERATE_YEARLY,
  PLAN_FREE,
  PLAN_GROW,
  PLAN_GROW_YEARLY,
  PLAN_HOBBY,
  PLAN_HOBBY_YEARLY,
  PLAN_LAUNCH,
  PLAN_LAUNCH_YEARLY,
  PLAN_PRO,
  PLAN_PRO_YEARLY,
  PLAN_STARTER,
  PLAN_STARTER_YEARLY,
} from "@packages/common/plans";

const plansOrder = [
  [PLAN_FREE.id],
  [PLAN_HOBBY.id, PLAN_HOBBY_YEARLY.id, PLAN_LAUNCH.id, PLAN_LAUNCH_YEARLY.id],
  [PLAN_STARTER.id, PLAN_STARTER_YEARLY.id, PLAN_GROW.id, PLAN_GROW_YEARLY.id],
  [
    PLAN_PRO.id,
    PLAN_PRO_YEARLY.id,
    PLAN_ACCELERATE.id,
    PLAN_ACCELERATE_YEARLY.id,
  ],
];

export function isEnabled(fromPlanId: string, userPlanId: string) {
  const userPlanIdx = plansOrder.findIndex((p) => p.includes(userPlanId));
  const fromPlanIdx = plansOrder.findIndex((p) => p.includes(fromPlanId));

  return userPlanIdx >= fromPlanIdx;
}
