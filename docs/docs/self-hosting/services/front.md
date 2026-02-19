---
sidebar_position: 1
---

# front

## Overview

The `front` service is the main React-based web interface for CrawlChat. It provides users with a modern, responsive web application to interact with the chatbot system, manage conversations, and configure knowledge sources.

### Architecture & Features

- **Framework**: React with React Router for client-side routing
- **UI Library**: Tailwind CSS with DaisyUI components
- **State Management**: React hooks and context
- **Real-time Communication**: WebSocket integration for live chat
- **Authentication**: JWT-based authentication with OAuth support (Google)
- **File Processing**: Integration with Marker service for document conversion
- **Email Integration**: Resend integration for transactional emails
- **Port**: 3001 (container port 3000)

### Dependencies

- Database service (MongoDB) for user data and sessions

## Environment Variables

| Variable                      | Required | Description                                           | Example                                                      |
| ----------------------------- | -------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| `VITE_APP_URL`                | Yes      | Public URL where the frontend is accessible           | `"http://localhost:3001"` or `"https://yourdomain.com"`      |
| `VITE_SERVER_WS_URL`          | Yes      | WebSocket URL for the server service                  | `"ws://localhost:3002"` or `"wss://api.yourdomain.com"`      |
| `VITE_SERVER_URL`             | Yes      | HTTP URL for the server service                       | `"http://localhost:3002"` or `"https://api.yourdomain.com"`  |
| `VITE_SOURCE_SYNC_URL`        | Yes      | URL for the source-sync service                       | `"http://localhost:3003"` or `"https://sync.yourdomain.com"` |
| `VITE_GITHUB_APP_INSTALL_URL` | No       | GitHub App installation URL                           | `"https://github.com/apps/crawlchat/installations/new"`      |
| `DEFAULT_SIGNUP_PLAN_ID`      | Yes      | Default subscription plan ID for new user signups     | `"accelerate-yearly"`                                        |
| `MARKER_HOST`                 | Yes      | Host of marker service to convert files into markdown | `"http://localhost:3005"`                                    |
| `MARKER_API_KEY`              | Yes      | A secret API Key configured in marker env             | `a-secret-key-for-marker`                                    |
| `RESEND_FROM_EMAIL`           | No       | Email address for sending emails via Resend           | `"noreply@yourdomain.com"`                                   |
| `RESEND_KEY`                  | No       | Resend API key for email functionality                | `"re_xxxxxxxxxxxxx"`                                         |
| `GOOGLE_CLIENT_ID`            | No       | Google OAuth client ID                                | `"xxxxx.apps.googleusercontent.com"`                         |
| `GOOGLE_CLIENT_SECRET`        | No       | Google OAuth client secret                            | `"GOCSPX-xxxxx"`                                             |
| `GOOGLE_REDIRECT_URI`         | No       | Google OAuth redirect URI                             | `"https://yourdomain.com/auth/google/callback"`              |
| `ADMIN_EMAILS`                | No       | Comma-separated list of admin email addresses         | `"admin1@example.com,admin2@example.com"`                    |

## Running Locally

### Prerequisites

- Node.js 20
- MongoDB running locally or accessible

### Development Setup

1. **Navigate to the front directory**:

   ```bash
   cd front
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file or set environment variables with the required configuration.

4. **Start development server**:
   ```bash
   npm run dev
   ```

The development server will start on `http://localhost:3000` (note: different from production port 3001).

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking
- `npm run email` - Start email development server (port 3004)
