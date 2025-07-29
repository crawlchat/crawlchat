import type { User } from "libs/prisma";
import { Authenticator } from "remix-auth";
import { prisma } from "~/prisma";
import { sessionStorage } from "~/session";
import { EmailLinkStrategy } from "./email-strategy";
import { sendEmail, sendWelcomeEmail } from "~/email";
import { PLAN_FREE } from "libs/user-plan";

export const authenticator = new Authenticator<User | null>();

authenticator.use(
  new EmailLinkStrategy(
    {
      sendEmail: async ({ emailAddress, magicLink }) => {
        await sendEmail(
          emailAddress,
          "Login to CrawlChat",
          `Click here to login: ${magicLink}`
        );
      },
      secret: "secret",
      callbackURL: "/login/verify",
      successRedirect: "/app",
      failureRedirect: "/login",
      emailSentRedirect: "/login?mail-sent=true",
      sessionStorage,
    },
    async ({ email }) => {
      let user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email,
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

      return user;
    }
  ),
  "magic-link"
);
