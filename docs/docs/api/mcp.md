---
sidebar_position: 6
---

# MCP

Use this API to connect to CrawlChat as a hosted MCP server with authenticated tools for reading and managing your collections.

:::note
This page documents the hosted MCP protocol endpoints. If you only need public search for one collection, use the [Public Answer API](/api/public-answer).
:::

:::note
If you are looking for MCP server for your documentation, go to [Connect > MCP server](/connect/mcp-server)
:::

### Install / Setup

Install and configure CrawlChat as a remote MCP server in your MCP client:

1. Create or copy your API key from [API Keys](https://crawlchat.app/api-key).
2. Add a remote MCP server in your client using the base URL below.
3. Pass your API key in the `x-api-key` header for every request.

### URL

```
https://wings.crawlchat.app/mcp
```

### Headers

| Key         | Type     | Note                          |
| ----------- | -------- | ----------------------------- |
| `x-api-key` | `STRING` | Required for all MCP requests |

### Available Tools

The hosted MCP server currently exposes these tools:

| Tool                        | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `get_user`                  | Returns authenticated user details                   |
| `get_collections`           | Lists collections available to the user              |
| `get_groups`                | Lists knowledge groups in a collection               |
| `get_data_gaps`             | Returns recent unresolved data gaps for a collection |
| `get_messages`              | Returns paginated recent messages for a collection   |
| `get_summary`               | Returns summary analytics for a date range           |
| `set_ai_model`              | Updates AI model for a collection                    |
| `set_collection_visibility` | Sets collection public/private visibility            |
| `set_prompt`                | Updates collection prompt                            |
| `set_show_sources`          | Enables or disables source visibility                |

### MCP Client Config Example

Use your MCP client's remote server config format with this URL and headers:

```json
{
  "name": "CrawlChat",
  "url": "https://wings.crawlchat.app/mcp",
  "headers": {
    "x-api-key": "YOUR_API_KEY"
  }
}
```

### HTTP Example

```bash
curl -X POST "https://wings.crawlchat.app/mcp" \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"example-client","version":"1.0.0"}}}'
```

### Error Responses

| Status | Body                                | Reason                                                        |
| ------ | ----------------------------------- | ------------------------------------------------------------- |
| `401`  | `{"error":"Invalid authorization"}` | Missing or invalid `x-api-key`, or session ownership mismatch |
| `400`  | `{"error":"Missing sessionId"}`     | Missing `sessionId` on `POST /mcp/messages`                   |
| `404`  | `{"error":"Session not found"}`     | Unknown or expired session ID                                 |
