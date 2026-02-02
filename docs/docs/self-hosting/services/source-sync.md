---
sidebar_position: 10
---

# Source Sync Service

## Overview

The Source Sync service is a background service that handles syncing documentation sources and maintaining the knowledge base using BullMQ queues. It processes various content sources like web pages, GitHub issues, Notion pages, and converts them into vector embeddings for semantic search.

### Architecture & Features

- **Framework**: Express.js with TypeScript
- **Queue System**: BullMQ with Redis for job processing
- **Content Processing**: Handles multiple source types (web, GitHub, Notion, Confluence, etc.)
- **Document Conversion**: Converts various formats to markdown and text
- **Web Scraping**: Playwright integration for dynamic content scraping
- **Vector Processing**: Pinecone integration for embedding storage
- **Port**: 3003 (container port 3000)

### Dependencies

- Redis service for queue management
- Database service (MongoDB) for metadata storage
- External APIs: Pinecone, GitHub (optional), ScrapeCreators (optional)

## Environment Variables

| Variable                 | Required | Description                                                             | Example                                  |
| ------------------------ | -------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `PINECONE_API_KEY`       | Yes      | Pinecone API key for vector database operations                         | `"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"` |
| `REDIS_URL`              | Yes      | Redis connection URL                                                    | `"redis://redis:6379"`                   |
| `GROUP_QUEUE_NAME`       | Yes      | Queue name for processing source groups                                 | `"crawlchat_source_sync_groups"`         |
| `ITEM_QUEUE_NAME`        | Yes      | Queue name for processing source items                                  | `"crawlchat_source_sync_items"`          |
| `SCRAPECREATORS_API_KEY` | No       | ScrapeCreators API key for web scraping features                        | `"YOUR_API_KEY"`                         |
| `GITHUB_TOKEN`           | No       | GitHub personal access token for fetching GitHub issues and discussions | `"ghp_xxxxxxxxxxxxx"`                    |

## Running Locally

### Prerequisites

- Node.js 22
- Redis running locally or accessible
- MongoDB running locally or accessible
- Pinecone API key

### Development Setup

1. **Navigate to the source-sync directory**:

   ```bash
   cd source-sync
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright browsers** (for web scraping):

   ```bash
   npx playwright install chromium
   ```

4. **Set up environment variables**:
   Create a `.env` file or set environment variables with the required configuration including Redis, database, and API keys.

5. **Start development server**:
   ```bash
   npm run dev
   ```

The development server will start on `http://localhost:3000` (note: different from production port 3003).

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
