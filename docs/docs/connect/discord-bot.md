---
sidebar_position: 2
---

# Discord bot

You can add the CrawlChat **Discord bot** to your Discord server and your community can just tag the bot and ask questions. Example, `@crawlchat` how to install it?

## Setup

Here is the step by step procedure of adding the Discord bot to the server and integrating it with your CrawlChat collection.

### 1. Install the bot

First step in the process is to install the [CrawlChat Discord Bot](https://discord.com/oauth2/authorize?client_id=1346845279692918804) on the server you want to integrate.

Once you go to the above link, it shows following screen and select Add to Server.

![Add to server](./images/discord-add-to-server.png)

Pick the server you want to add it to. Authorize it to add it to the server you selected.

![Authorize Discord bot](./images/discord-authorize.png)

### 2. Get Server Id

Next step is to connect your Discord server with your CrawlChat collection. You need to get your Discord Server Id and enter it on CrawlChat's [Discord Server Id](https://crawlchat.app/connect/discord#discord-server-id) section.

1. Go to your Discord server setting
2. Go to Engagement page
3. Go to Enable server widget section
4. Enable it for time being
5. Copy the server id
6. Close the Discord settings
7. Paste it in above CrawlChat's Discord Server Id section
8. Save it

![Discord server id](./images/discord-server-id.png)

This makes sure that your CrawlChat collection identifies your server and starts responding to the messages.

You are all set to tag `@crawlchat` and ask questions!

### 3. Configure

You can configure follwing items for the Discord bot

- `Channel names` If you want the bot to respond only on few channels, configure them [here](https://crawlchat.app/connect/discord#channel-names)
- `Reply as thread` Enable this to make the bot reply in threads
- `Image attachments` Enable this so that the bot can read the attached images in the Discord messages
