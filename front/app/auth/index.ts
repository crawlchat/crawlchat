import type { User } from "libs/prisma";
import { Authenticator } from "remix-auth";
import { prisma } from "~/prisma";
import { sessionStorage } from "~/session";
import { EmailLinkStrategy } from "./email-strategy";
import { sendEmail } from "~/email";
import { createToken } from "~/jwt";

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
          data: { email: email },
        });
      }

      return user;
    }
  ),
  "magic-link"
);
