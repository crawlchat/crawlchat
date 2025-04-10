import dotenv from "dotenv";
dotenv.config();

import { App } from "@slack/bolt";
import { InstallationStore } from "@slack/oauth";
import { prisma } from "libs/prisma";

const installationStore: InstallationStore = {
  storeInstallation: async (installation) => {
    if (!installation.team) {
      throw new Error("Team not found in installation");
    }

    const scrape = await prisma.scrape.findFirst({
      where: {
        slackTeamId: installation.team.id,
      },
    });

    if (!scrape) {
      throw new Error("Scrape not configured for this team");
    }

    await prisma.scrape.update({
      where: {
        id: scrape.id,
      },
      data: {
        slackConfig: {
          installation: installation as any,
        },
      },
    });
  },
  fetchInstallation: async (installQuery) => {
    const scrape = await prisma.scrape.findFirst({
      where: {
        slackTeamId: installQuery.teamId,
      },
    });

    if (!scrape || !scrape.slackConfig) {
      throw new Error("Scrape not found or configured");
    }

    return scrape.slackConfig.installation as any;
  },
  deleteInstallation: async (installQuery) => {
    const scrape = await prisma.scrape.findFirst({
      where: {
        slackTeamId: installQuery.teamId,
      },
    });

    if (!scrape) {
      throw new Error("Scrape not found");
    }

    await prisma.scrape.update({
      where: {
        id: scrape?.id,
      },
      data: {
        slackConfig: {
          installation: undefined,
        },
        slackTeamId: undefined,
      },
    });
  },
};

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: ["channels:history", "channels:read", "chat:write", "im:history"],
  redirectUri: `${process.env.HOST}/slack/oauth_redirect`,
  installationStore,
  installerOptions: {
    redirectUriPath: "/slack/oauth_redirect",
  },
});

app.message("hello", async ({ message, say, client, context }) => {
  // const history = await client.conversations.history({
  //   channel: message.channel,
  //   limit: 15,
  // });

  console.log({ context });

  await say({
    text: `Hey there <@${(message as any).user}>!`,
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3005);

  app.logger.info("⚡️ Bolt app is running!");
})();
