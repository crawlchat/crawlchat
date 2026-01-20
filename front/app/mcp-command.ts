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

export function makeCursorDeepLink(scrapeId: string, name: string) {
  const config = {
    [name]: {
      command: "npx",
      args: ["crawl-chat-mcp", `--id=${scrapeId}`, "--name=CrawlChat"],
    },
  };

  const configJson = JSON.stringify(config);
  const base64Config = btoa(configJson);

  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(
    name
  )}&config=${encodeURIComponent(base64Config)}`;
}

export function makeClaudeMcpJson(scrapeId: string, name: string) {
  return `"${name}": {
    "command": "npx",
    "args": ["crawl-chat-mcp", "--id=${scrapeId}", "--name=CrawlChat"]
}`;
}

export function makeClaudeDeepLink(scrapeId: string, name: string) {
  const encodedName = encodeURIComponent(name);
  const command = "npx";
  const args = ["crawl-chat-mcp", `--id=${scrapeId}`, "--name=CrawlChat"];

  let url = `mcp-install://install-server?name=${encodedName}&command=${encodeURIComponent(command)}`;

  // Add args
  args.forEach(arg => {
    url += `&args=${encodeURIComponent(arg)}`;
  });

  return url;
}
