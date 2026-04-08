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
  const existingItem = await prisma.scrapeItem.count({
    where: { scrapeId, url, knowledgeGroupId, status: "completed" },
  });

  console.log("existingItem", existingItem);

  if (existingItem > 0) {
    return;
  }

  const limit = userPlan?.limits?.pages ?? PLAN_FREE.limits.pages;
  const pagesCount = await getPagesCount(userId);

  console.log("checking limit", { limit, pagesCount, n });

  if (pagesCount + n <= limit) {
    return;
  }
  throw new Error("APP: Pages limit reached for the plan");
};
