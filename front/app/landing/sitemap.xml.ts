import { readPosts } from "../blog/posts";

const BASE_URL = "https://crawlchat.app";

const staticPaths = [
  "/",
  "/pricing",
  "/discord-bot",
  "/support-tickets",
  "/ai-models",
  "/open-source",
  "/public-bots",
  "/ask-github-repo",
  "/changelog",
  "/terms",
  "/policy",
  "/data-privacy",
  "/use-case/community-support",
  "/use-case/empower-gtm-teams",
  "/use-case/discord-bot",
  "/use-case/mcp",
  "/compare/crawlchat-vs-kapaai",
  "/compare/crawlchat-vs-docsbot",
  "/compare/crawlchat-vs-chatbase",
  "/compare/crawlchat-vs-mava",
  "/compare/crawlchat-vs-sitegpt",
  "/case-study/remotion",
  "/case-study/polotno",
  "/case-study/postiz",
  "/case-study/localstack",
];

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toUrlTag(path: string, lastmod?: string) {
  const loc = `${BASE_URL}${path}`;
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  return `<url><loc>${xmlEscape(loc)}</loc>${lastmodTag}</url>`;
}

export function loader() {
  const changelogPosts = readPosts("changelog")
    .filter((post) => post.type === "changelog" && post.status === "published")
    .map((post) => ({
      path: `/changelog/${post.slug}`,
      lastmod: post.date.toISOString().slice(0, 10),
    }));

  const now = new Date().toISOString().slice(0, 10);
  const staticUrls = staticPaths.map((path) => ({ path, lastmod: now }));
  const urls = [...staticUrls, ...changelogPosts];
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((url) => toUrlTag(url.path, url.lastmod)).join("") +
    `</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
