import { prisma } from "libs/prisma";
import { PLAN_FREE } from "libs/user-plan";
import { sendWelcomeEmail } from "~/email";

export async function signUpNewUser(
  email: string,
  data?: { name?: string; photo?: string }
) {
  let user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email,
        name: data?.name,
        photo: data?.photo,
        plan: {
          planId: PLAN_FREE.id,
          type: PLAN_FREE.type,
          provider: "CUSTOM",
          status: "ACTIVE",
          credits: PLAN_FREE.credits,
          limits: PLAN_FREE.limits,
          activatedAt: new Date(),
        },
      },
    });

    const pendingScrapeUsers = await prisma.scrapeUser.findMany({
      where: {
        email: email,
        invited: true,
      },
    });

    for (const scrapeUser of pendingScrapeUsers) {
      await prisma.scrapeUser.update({
        where: {
          id: scrapeUser.id,
        },
        data: {
          invited: false,
          userId: user.id,
        },
      });
    }

    await sendWelcomeEmail(email);
  }

  if (data?.photo) {
    await prisma.user.update({
      where: { id: user.id },
      data: { photo: data.photo },
    });
  }

  return user;
}
