import dotenv from "dotenv";
dotenv.config();

import { App } from "@slack/bolt";
import { FileInstallationStore } from "@slack/oauth";

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: "a-secret",
  scopes: ["channels:history", "channels:read", "chat:write", "im:history"],
  redirectUri:
    "https://4cab-2409-40f0-11c4-ab2a-1da0-318f-ddca-b135.ngrok-free.app/slack/oauth_redirect",
  installationStore: new FileInstallationStore(),
  installerOptions: {
    redirectUriPath: "/slack/oauth_redirect",
  },
});

app.message("hello", async ({ message, say, client }) => {
  const history = await client.conversations.history({
    channel: message.channel,
    limit: 15,
  });

  console.log(history);

  await say({
    text: `Hey there <@${(message as any).user}>!`,
    thread_ts: message.ts,
  });
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3005);

  app.logger.info("⚡️ Bolt app is running!");
})();
