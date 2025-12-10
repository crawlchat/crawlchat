import type { Scrape } from "libs/prisma";

export function makeMcpName(scrape: Scrape) {
  const name =
    scrape.mcpToolName ?? scrape.title?.replaceAll(" ", "_") ?? scrape.url;

  return name ?? "documentation";
}

export function makeMcpCommand(scrapeId: string, name: string) {
  return `npx crawl-chat-mcp --id=${scrapeId} --name=${name}`;
}

export function makeCursorMcpJson(scrapeId: string, name: string) {
  return `"${name?.replaceAll("_", "-")}": {
    "command": "npx",
    "args": [
        "crawl-chat-mcp",
        "--id=${scrapeId}",
        "--name=${name}"
    ]
}`;
}

export function makeCursorMcpConfig(scrapeId: string, name: string) {
  return `{
    "command": "npx",
    "args": [
        "crawl-chat-mcp",
        "--id=${scrapeId}",
        "--name=${name}"
    ]
}`;
}
