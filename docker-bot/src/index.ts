import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  Events,
  GatewayIntentBits,
  Message,
  Snowflake,
} from "discord.js";
import { getUserId, learn, query } from "./api";
import { createToken } from "./jwt";

type DiscordMessage = Message<boolean>;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
  ],
});

const fetchAllParentMessages = async (
  message: DiscordMessage,
  messages: DiscordMessage[],
  i = 0
) => {
  if (i > 10) {
    return messages;
  }

  if (!message?.reference?.messageId) {
    return messages;
  }

  const parentMessage = await message.channel.messages.fetch(
    message.reference.messageId
  );

  messages.push(parentMessage);

  return fetchAllParentMessages(parentMessage, messages, i + 1);
};

const cleanContent = (content: string) => {
  return content.replace(/\n/g, "\n\n");
};

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.mentions.users.has(process.env.BOT_USER_ID!)) {
    if (message.content.includes("learn")) {
      const messages = await fetchAllParentMessages(message, []);

      const content = messages
        .map((m) => m.content)
        .reverse()
        .map(cleanContent)
        .join("\n\n");

      const { scrapeId, userId } = await getUserId(message.guildId!);

      await learn(scrapeId, content, createToken(userId));

      message.reply("Added to collection!");
    } else if (message.content.includes("answer")) {
      const parentMessage = await message.channel.messages.fetch(
        message.reference?.messageId as Snowflake
      );

      const { scrapeId, userId } = await getUserId(message.guildId!);

      const { answer } = await query(
        scrapeId,
        parentMessage.content,
        createToken(userId)
      );

      message.reply(answer);
    } else {
      const { scrapeId, userId } = await getUserId(message.guildId!);

      const { answer } = await query(
        scrapeId,
        message.content.replace(`<@${process.env.BOT_USER_ID}>`, "").trim(),
        createToken(userId)
      );

      message.reply(answer);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
