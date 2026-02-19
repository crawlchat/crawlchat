---
sidebar_position: 4
---

# discord-bot

## Overview

The `discord-bot` service provides integration with Discord, allowing users to interact with CrawlChat directly within Discord servers. The bot can answer questions and provide information based on the configured knowledge base.

### Architecture & Features

- **Framework**: Node.js with TypeScript
- **Discord Integration**: Discord.js library for bot functionality
- **Authentication**: JWT-based authentication with the main server
- **Message Processing**: Real-time message handling and responses
- **Server Communication**: HTTP integration with the main server service
- **Port**: None exposed (internal service only)

### Dependencies

- Database service (MongoDB) for bot configuration and user data
- Main server service for processing requests

## Environment Variables

| Variable           | Required | Description                                         | Example                                                     |
| ------------------ | -------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `APP_ID`           | Yes      | Discord application ID                              | `"123456789012345678"`                                      |
| `DISCORD_TOKEN`    | Yes      | Discord bot token                                   | `"xxxxxxxx.yyyyyyyy.zzzzzzzzzzzzzzzzz"`                     |
| `BOT_USER_ID`      | Yes      | Discord bot user ID                                 | `"123456789012345678"`                                      |
| `ALL_BOT_USER_IDS` | Yes      | All bot user IDs                                    | `"123456789012345678,1234561327012345678"`                  |
| `SERVER_HOST`      | Yes      | Server host URL for Discord bot to communicate with | `"http://localhost:3002"` or `"https://api.yourdomain.com"` |

## Running Locally

### Prerequisites

- Node.js 22
- Discord application and bot token (from Discord Developer Portal)
- Main server service running

### Development Setup

1. **Navigate to the discord-bot directory**:

   ```bash
   cd discord-bot
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file with your Discord bot credentials and server configuration.

4. **Start development server**:
   ```bash
   npm run dev
   ```

The bot will connect to Discord and start listening for messages.

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server

### Discord Setup

To set up the Discord bot:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token and application ID
5. Set the required permissions (Send Messages, Read Message History, etc.)
6. Invite the bot to your server using the OAuth2 URL generator
