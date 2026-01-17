---
sidebar_position: 50
---

# Selfhosting CrawlChat

## ⚠️ Important Notice

**This self-hosting guide is NOT production-ready.** The self-hosted version is provided as-is for development, testing, and evaluation purposes. For production use, we strongly recommend using the managed cloud service at [https://crawlchat.app/](https://crawlchat.app/).

**Support is not guaranteed for self-hosting users.** If you encounter issues while self-hosting, you may need to troubleshoot independently or use the production cloud service.

## Overview

CrawlChat is a multi-service application that consists of several Docker containers working together. The main services include:

- **front**: React-based web interface (port 3001)
- **server**: Express API server handling LLM interactions (port 3002)
- **source_sync**: BullMQ-based service for syncing documentation sources (port 3003)
- **discord_bot**: Discord bot integration (no exposed ports)
- **slack_app**: Slack app integration (port 3004)
- **database**: MongoDB 7 with replica set configuration
- **redis**: Redis 7 for queue management

## Prerequisites

Before you begin, ensure you have:

1. **Docker** and **Docker Compose** installed on your system
2. **External API Keys**:
   - Pinecone API key ([Get one here](https://www.pinecone.io))
   - OpenRouter API key ([Get one here](https://openrouter.ai))
3. **Domain/Network Configuration**: 
   - A domain name or IP address where services will be accessible (if not using localhost)
   - Proper network configuration for services to communicate
4. **Optional Services** (for full functionality):
   - Discord bot credentials (if using Discord integration)
   - Slack app credentials (if using Slack integration)
   - Resend API key (for email functionality)
   - Google OAuth credentials (for Google sign-in)
   - GitHub token (for GitHub source syncing)
   - ScrapeCreators API key (for web scraping features)

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/crawlchat/crawlchat.git
   cd crawlchat
   ```

2. **Create a docker-compose override file** (optional, for custom configuration):
   ```bash
   cp docker-compose.yml docker-compose.override.yml
   ```

3. **Edit environment variables** in `docker-compose.yml`:
   - Replace `<PINECONE_API_KEY>` with your Pinecone API key
   - Replace `<OPENROUTER_API_KEY>` with your OpenRouter API key
   - Update `JWT_SECRET` with a strong, random secret (use the same value for all services)
   - Update URLs if not using localhost (see Environment Variables section)

4. **Start the services**:
   ```bash
   docker-compose up -d
   ```

5. **Wait for initialization**: The `mongo-init` service will automatically configure MongoDB replica set. This may take a minute or two.

6. **Access the application**:
   - Frontend: http://localhost:3001
   - Server API: http://localhost:3002
   - Source Sync API: http://localhost:3003
   - Slack App (if configured): http://localhost:3004

## Environment Variables

### Common Variables (All Services)

These variables should be set consistently across all services:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SELF_HOSTED` | Yes | Must be set to `"true"` for self-hosted deployments | `"true"` |
| `DATABASE_URL` | Yes | MongoDB connection string with replica set | `"mongodb://database:27017/crawlchat?replicaSet=rs0"` |
| `JWT_SECRET` | Yes | Secret key for JWT token signing. **Must be the same across all services** | `"a-long-random-secret-string"` |

### Front Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_APP_URL` | Yes | Public URL where the frontend is accessible | `"http://localhost:3001"` or `"https://yourdomain.com"` |
| `VITE_SERVER_WS_URL` | Yes | WebSocket URL for the server service | `"ws://localhost:3002"` or `"wss://api.yourdomain.com"` |
| `VITE_SERVER_URL` | Yes | HTTP URL for the server service | `"http://localhost:3002"` or `"https://api.yourdomain.com"` |
| `VITE_SOURCE_SYNC_URL` | Yes | URL for the source-sync service | `"http://localhost:3003"` or `"https://sync.yourdomain.com"` |
| `DEFAULT_SIGNUP_PLAN_ID` | Yes | Default subscription plan ID for new user signups | `"accelerate-yearly"` |
| `RESEND_FROM_EMAIL` | No | Email address for sending emails via Resend | `"noreply@yourdomain.com"` |
| `RESEND_KEY` | No | Resend API key for email functionality | `"re_xxxxxxxxxxxxx"` |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID | `"xxxxx.apps.googleusercontent.com"` |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret | `"GOCSPX-xxxxx"` |
| `GOOGLE_REDIRECT_URI` | No | Google OAuth redirect URI | `"https://yourdomain.com/auth/google/callback"` |
| `ADMIN_EMAILS` | No | Comma-separated list of admin email addresses | `"admin1@example.com,admin2@example.com"` |

### Server Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SOURCE_SYNC_URL` | Yes | Internal URL for the source-sync service | `"http://source_sync:3000"` |
| `PINECONE_API_KEY` | Yes | Pinecone API key for vector database operations | `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"` |
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM access | `"sk-or-v1-xxxxxxxxxxxxx"` |
| `ADMIN_EMAILS` | No | Comma-separated list of admin email addresses | `"admin1@example.com,admin2@example.com"` |
| `OPENAI_API_KEY` | No | OpenAI API key (if using OpenAI directly instead of OpenRouter) | `"sk-xxxxxxxxxxxxx"` |

### Source Sync Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PINECONE_API_KEY` | Yes | Pinecone API key for vector database operations | `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"` |
| `REDIS_URL` | Yes | Redis connection URL | `"redis://redis:6379"` |
| `GROUP_QUEUE_NAME` | Yes | Queue name for processing source groups | `"crawlchat_source_sync_groups"` |
| `ITEM_QUEUE_NAME` | Yes | Queue name for processing source items | `"crawlchat_source_sync_items"` |
| `SCRAPECREATORS_API_KEY` | No | ScrapeCreators API key for web scraping features | `"YOUR_API_KEY"` |
| `GITHUB_TOKEN` | No | GitHub personal access token for fetching GitHub issues and discussions | `"ghp_xxxxxxxxxxxxx"` |

### Discord Bot Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `APP_ID` | Yes | Discord application ID | `"123456789012345678"` |
| `DISCORD_TOKEN` | Yes | Discord bot token | `"xxxxxxxx.yyyyyyyy.zzzzzzzzzzzzzzzzz"` |
| `BOT_USER_ID` | Yes | Discord bot user ID | `"123456789012345678"` |
| `ALL_BOT_USER_IDS` | Yes | All bot user IDs | `"123456789012345678,1234561327012345678"` |
| `SERVER_HOST` | Yes | Server host URL for Discord bot to communicate with | `"http://localhost:3002"` or `"https://api.yourdomain.com"` |

### Slack App Service

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SERVER_HOST` | Yes | Server host URL for Slack app to communicate with | `"http://localhost:3002"` or `"https://api.yourdomain.com"` |
| `SLACK_SIGNING_SECRET` | Yes | Slack app signing secret | `"8f742231b10e8888abcd99yyyzzz85a5"` |
| `SLACK_CLIENT_ID` | Yes | Slack app client ID | `"33336676.569200954261"` |
| `SLACK_CLIENT_SECRET` | Yes | Slack app client secret | `"2141029472.691202649728"` |
| `SLACK_STATE_SECRET` | Yes | Slack state secret for OAuth flow | `""` |
| `HOST` | Yes | Host URL where the Slack app is accessible | `"http://localhost:3004"` or `"https://slack.yourdomain.com"` |

## Service Details

### Front Service

- **Image**: `ghcr.io/crawlchat/crawlchat-front:latest`
- **Port**: 3001 (mapped to container port 3000)
- **Dependencies**: database
- **Purpose**: React-based web interface for users to interact with CrawlChat

### Server Service

- **Image**: `ghcr.io/crawlchat/crawlchat-server:latest`
- **Port**: 3002 (mapped to container port 3000)
- **Dependencies**: database
- **Purpose**: Main API server handling LLM interactions, user requests, and business logic

### Source Sync Service

- **Image**: `ghcr.io/crawlchat/crawlchat-source-sync:latest`
- **Port**: 3003 (mapped to container port 3000)
- **Dependencies**: redis, database
- **Purpose**: Background service for syncing documentation sources and maintaining the knowledge base using BullMQ queues

### Discord Bot Service

- **Image**: `ghcr.io/crawlchat/crawlchat-discord:latest`
- **Port**: None exposed (internal only)
- **Dependencies**: database
- **Purpose**: Discord bot integration for answering questions in Discord servers
- **Note**: Requires Discord bot setup and webhook configuration

### Slack App Service

- **Image**: `ghcr.io/crawlchat/crawlchat-slack:latest`
- **Port**: 3004 (mapped to container port 3000)
- **Dependencies**: database
- **Purpose**: Slack app integration for answering questions in Slack workspaces
- **Note**: Requires Slack app setup and OAuth configuration

### Database Service (MongoDB)

- **Image**: `mongo:7`
- **Port**: Not exposed externally (internal only)
- **Configuration**: 
  - Replica set name: `rs0`
  - No authentication enabled (for self-hosting)
  - Health checks enabled
- **Volumes**: `crawlchat_mongo_data` (persistent storage)
- **Initialization**: The `mongo-init` service automatically initializes the replica set

### Redis Service

- **Image**: `redis:7`
- **Port**: Not exposed externally (internal only)
- **Configuration**:
  - AOF (Append Only File) persistence enabled
  - Health checks enabled
- **Volumes**: `crawlchat_redis_data` (persistent storage)
- **Purpose**: Queue management for source-sync service

## Network Configuration

All services run on a Docker bridge network named `crawlchat-net`. Services communicate using their service names as hostnames:

- `database` - MongoDB service
- `redis` - Redis service
- `source_sync` - Source sync service (internal name)

## Troubleshooting

### MongoDB Replica Set Not Initializing

If MongoDB fails to initialize the replica set:

1. Check the `mongo-init` service logs:
   ```bash
   docker-compose logs mongo-init
   ```

2. Ensure the database service is healthy before mongo-init runs

3. Manually initialize if needed:
   ```bash
   docker-compose exec database mongosh --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"database:27017"}]})'
   ```

### Services Can't Connect to Database

- Verify all services use the same `DATABASE_URL` format: `mongodb://database:27017/crawlchat?replicaSet=rs0`
- Ensure services are on the same Docker network (`crawlchat-net`)
- Check that the database service is running and healthy

### Services Can't Connect to Redis

- Verify `REDIS_URL` is set to `redis://redis:6379` in source-sync service
- Ensure source-sync service depends on redis in docker-compose.yml
- Check redis service health

### Port Conflicts

If ports 3001-3004 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3005:3000"  # Change external port
```

Remember to update corresponding environment variables (e.g., `VITE_APP_URL`) to match.

### JWT Secret Mismatch

All services must use the **exact same** `JWT_SECRET` value. If authentication fails between services, verify all services have identical `JWT_SECRET` values.
