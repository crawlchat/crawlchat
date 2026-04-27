import { RateLimiter } from "@packages/common/rate-limiter";
import { Router } from "express";
import { scrape } from "../scrape/crawl";
import { getMetaTitle } from "../scrape/parse";

const router = Router();

const websiteToMarkdownRateLimiter = new RateLimiter(10, "website-to-markdown");

const MAX_MARKDOWN_CHARS = 500_000;

type ValidateResult = { ok: true; url: URL } | { ok: false; message: string };

function validatePublicHttpUrl(raw: string): ValidateResult {
  const trimmed = raw.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: "Invalid URL" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, message: "Only http and https URLs are supported" };
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    host.endsWith(".local")
  ) {
    return { ok: false, message: "This URL cannot be scraped" };
  }
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const [a, b] = ipv4.slice(1, 3).map(Number);
    if (a === 10) {
      return { ok: false, message: "This URL cannot be scraped" };
    }
    if (a === 127 || a === 0) {
      return { ok: false, message: "This URL cannot be scraped" };
    }
    if (a === 169 && b === 254) {
      return { ok: false, message: "This URL cannot be scraped" };
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return { ok: false, message: "This URL cannot be scraped" };
    }
    if (a === 192 && b === 168) {
      return { ok: false, message: "This URL cannot be scraped" };
    }
  }
  return { ok: true, url: parsed };
}

router.post("/", async (req, res) => {
  try {
    websiteToMarkdownRateLimiter.check();
  } catch {
    res.status(429).json({
      message: "Too many requests. Try again in a minute.",
    });
    return;
  }

  const urlRaw = req.body?.url as string | undefined;
  if (!urlRaw || typeof urlRaw !== "string") {
    res.status(400).json({ message: "Missing url" });
    return;
  }

  const validated = validatePublicHttpUrl(urlRaw);
  if (!validated.ok) {
    res.status(400).json({ message: validated.message });
    return;
  }

  const started = Date.now();
  const { parseOutput, error, statusCode } = await scrape(
    validated.url.toString()
  );
  const durationMs = Date.now() - started;

  const title = getMetaTitle(parseOutput.metaTags) ?? null;
  let markdown = parseOutput.markdown;
  let truncated = false;
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    markdown = markdown.slice(0, MAX_MARKDOWN_CHARS);
    truncated = true;
  }

  const wordCount = parseOutput.text
    .split(/\s+/)
    .filter((word: string) => word.length > 0).length;

  res.json({
    url: validated.url.toString(),
    title,
    markdown,
    truncated,
    plainText: parseOutput.text,
    wordCount,
    characterCount: markdown.length,
    linkCount: parseOutput.links.length,
    durationMs,
    httpStatus: statusCode,
    dynamicScrapeError: error ?? null,
  });
});

export default router;
