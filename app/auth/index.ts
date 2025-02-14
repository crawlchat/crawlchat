import type { User } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { prisma } from "~/prisma";
import { sessionStorage } from "~/session";
import { EmailLinkStrategy } from "./email-strategy";
import { sendEmail } from "~/email";

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
      successRedirect: "/dashboard/home",
      failureRedirect: "/login",
      emailSentRedirect: "/login?mail-sent=true",
      sessionStorage,
    },
    async ({ email }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        return existingUser;
      }

      return await prisma.user.create({
        data: { email: email },
      });
    }
  ),
  "magic-link"
);
