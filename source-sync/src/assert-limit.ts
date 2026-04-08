import { PLAN_FREE } from "@packages/common/plans";
import { prisma, UserPlan } from "@packages/common/prisma";
import { getPagesCount } from "@packages/common/user-plan";

export const assertLimit = async (
  url: string,
  n: number,
  scrapeId: string,
  knowledgeGroupId: string,
  userId: string,
  userPlan: UserPlan | null
) => {
  const existingItems = await prisma.scrapeItem.count({
    where: { scrapeId, url, knowledgeGroupId, status: "completed" },
  });

  if (existingItems > 0) {
    return;
  }

  const limit = userPlan?.limits?.pages ?? PLAN_FREE.limits.pages;
  const pagesCount = await getPagesCount(userId);

  if (pagesCount + n <= limit) {
    return;
  }
  throw new Error("APP: Pages limit reached for the plan");
};
