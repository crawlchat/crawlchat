---
sidebar_position: 4
---

# GitHub app

You can integrate CrawlChat with GitHub to automatically answer questions on GitHub Discussions and Issues. The bot will respond to mentions or when it has high-confidence answers based on your knowledge base.

## Setup

### 1. Install the GitHub App

1. Visit the [GitHub App installation page](https://github.com/apps/crawlchat/installations/new)
2. Choose the repositories you want CrawlChat to access
3. Complete the installation

### 2. Configure Repository Access

1. Go to your CrawlChat dashboard
2. Navigate to **Integrate → GitHub app**
3. Enter your repository slug in the format `owner/repo` (e.g., `crawlchat/crawlchat`)
4. Save the configuration

### 3. Set up Webhook (Self-hosted only)

For self-hosted installations, configure the webhook in your GitHub App settings:

- **Webhook URL**: `https://your-domain.com/github/webhook`
- **Webhook Secret**: Set to match your `GITHUB_WEBHOOK_SECRET` environment variable
- **Events**: Enable `Discussion comment` and `Issue comment`

## How it works

The GitHub app will:

- **Monitor discussions and issues** in configured repositories
- **Respond to @mentions** of the app (e.g., `@crawlchat`)
- **Auto-respond** to questions where it has high confidence answers (above your configured minimum score)

## Troubleshooting

### Bot not responding

1. Verify the repository slug is correctly set in the dashboard
2. Ensure the GitHub App has access to the repository
3. Check that webhook events are properly configured (self-hosted)
