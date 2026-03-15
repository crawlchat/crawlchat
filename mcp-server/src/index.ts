#! /usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import commandLineArgs from "command-line-args";
import { z } from "zod";

const HOST = "https://wings.crawlchat.app";

const options = commandLineArgs([
  { name: "id", alias: "i", type: String },
  { name: "name", alias: "n", type: String },
]);

const server = new McpServer({
  name: "crawl-chat",
  version: "1.0.0",
  description:
    "CrawlChat MCP server for searching a specific documentation collection.",
});

server.tool(
  options.name,
  "Searches the configured CrawlChat collection for a concise query.",
  {
    query: z.string({
      description: "The query to search for. Keep it short and concise.",
    }),
  },
  async function ({ query }: { query: string }) {
    const res = await fetch(`${HOST}/mcp/${options.id}?query=${query}`);

    return {
      content: [{ type: "text", text: await res.text() }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
