---
sidebar_position: 4
---

# MCP server

By default your CrawlChat bot can be used as a MCP server so that the AI apps such as Cursor, Claude App, Claude Code and more can read your docs on demand and do tasks autonomously.

Here is how your community memebers can access the bot as an MCP server. Insert your collection id and bot name.

## Generic

Your community can install it as an MCP server with following command

```bash
npx crawl-chat-mcp --id=YOUR_COLLECTION_ID --name=MyBot
```

## Cursor

Your community can install it as an MCP server on Cursor by adding following MCP tool config

```json
"CrawlChat": {
    "command": "npx",
    "args": [
        "crawl-chat-mcp",
        "--id=YOUR_COLLECTION_ID",
        "--name=MyBot"
    ]
}
```

You can also distribute the MCP setup instructions to your community by the embed chatbot. Enable it from `MCP setup instructions` section on [Connect](https://crawlchat.app/connect) page.
