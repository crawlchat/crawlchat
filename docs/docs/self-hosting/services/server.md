---
sidebar_position: 2
---

# server

## Overview

The `server` service is the main API server that handles LLM interactions, user requests, and business logic for the CrawlChat application. It serves as the central backend that coordinates between the frontend, database, and external AI services.

### Architecture & Features

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT-based authentication
- **Real-time Communication**: WebSocket support for live chat
- **AI Integration**: OpenRouter and OpenAI API integration
- **Vector Database**: PGVector or Pinecone
- **Port**: 3002 (container port 3000)

### Dependencies

- Database service (MongoDB) for persistent data storage
- External APIs: OpenRouter

## Environment Variables

| Variable                 | Required | Description                                                     | Example                                   |
| ------------------------ | -------- | --------------------------------------------------------------- | ----------------------------------------- |
| `SOURCE_SYNC_URL`        | Yes      | Internal URL for the source-sync service                        | `"http://source_sync:3000"`               |
| `OPENROUTER_API_KEY`     | Yes      | OpenRouter API key for LLM access                               | `"sk-or-v1-xxxxxxxxxxxxx"`                |
| `ADMIN_EMAILS`           | No       | Comma-separated list of admin email addresses                   | `"admin1@example.com,admin2@example.com"` |
| `OPENAI_API_KEY`         | No       | OpenAI API key (if using OpenAI directly instead of OpenRouter) | `"sk-xxxxxxxxxxxxx"`                      |
| `GITHUB_APP_ID`          | No       | GitHub App ID for webhook authentication                        | `"123456"`                                |
| `GITHUB_APP_PRIVATE_KEY` | No       | Private key for GitHub App authentication                       | `"-----BEGIN RSA PRIVATE KEY-----\n..."`  |
| `GITHUB_WEBHOOK_SECRET`  | No       | Secret for verifying GitHub webhook signatures                  | `"your-webhook-secret"`                   |

## Running Locally

### Prerequisites

- Node.js 22
- MongoDB running locally or accessible
- OpenRouter or OpenAI API key

### Development Setup

1. **Navigate to the server directory**:

   ```bash
   cd server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file or set environment variables with the required configuration including database connection and API keys.

4. **Generate Prisma client** (if not already done):

   ```bash
   npx prisma generate
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

The development server will start on `http://localhost:3000` (note: different from production port 3002).

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run cli` - Run CLI commands
- `npm run cron` - Run cron jobs
