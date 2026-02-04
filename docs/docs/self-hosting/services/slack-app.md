---
sidebar_position: 5
---

# slack-app

## Overview

The `slack-app` service provides integration with Slack, enabling users to interact with CrawlChat within Slack workspaces. The app can answer questions and provide information based on the configured knowledge base.

### Architecture & Features

- **Framework**: Node.js with TypeScript
- **Slack Integration**: Slack Bolt framework for app functionality
- **Authentication**: JWT-based authentication with the main server
- **OAuth Flow**: Slack OAuth for workspace installation
- **Message Processing**: Real-time message handling and responses
- **Markdown Support**: Slack markdown rendering
- **Port**: 3004 (container port 3000)

### Dependencies

- Database service (MongoDB) for app configuration and user data
- Main server service for processing requests

## Environment Variables

| Variable               | Required | Description                                       | Example                                                       |
| ---------------------- | -------- | ------------------------------------------------- | ------------------------------------------------------------- |
| `SERVER_HOST`          | Yes      | Server host URL for Slack app to communicate with | `"http://localhost:3002"` or `"https://api.yourdomain.com"`   |
| `SLACK_SIGNING_SECRET` | Yes      | Slack app signing secret                          | `"8f742231b10e8888abcd99yyyzzz85a5"`                          |
| `SLACK_CLIENT_ID`      | Yes      | Slack app client ID                               | `"33336676.569200954261"`                                     |
| `SLACK_CLIENT_SECRET`  | Yes      | Slack app client secret                           | `"2141029472.691202649728"`                                   |
| `SLACK_STATE_SECRET`   | Yes      | Slack state secret for OAuth flow                 | `""`                                                          |
| `HOST`                 | Yes      | Host URL where the Slack app is accessible        | `"http://localhost:3004"` or `"https://slack.yourdomain.com"` |

## Running Locally

### Prerequisites

- Node.js 22
- Slack app credentials (from Slack API)
- Main server service running

### Development Setup

1. **Navigate to the slack-app directory**:

   ```bash
   cd slack-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file with your Slack app credentials and server configuration.

4. **Start development server**:
   ```bash
   npm run dev
   ```

The Slack app will start on `http://localhost:3000` (note: different from production port 3004) and listen for Slack events.

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server

### Slack Setup

To set up the Slack app:

1. Go to the [Slack API](https://api.slack.com/apps)
2. Create a new app from manifest or scratch
3. Configure OAuth permissions (channels:read, chat:write, etc.)
4. Set up event subscriptions for message events
5. Configure the OAuth redirect URLs
6. Install the app to your workspace
7. Copy the client ID, client secret, and signing secret to your environment variables
