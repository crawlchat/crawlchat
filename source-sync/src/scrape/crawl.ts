import { parseHtml, ParseOutput } from "./parse";
import { scrapePw } from "./playwright";

const heavyFiles = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".mp4",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".rar",
  ".7z",
  ".tar",
  ".gz",
  ".bz2",
  ".xz",
  ".wmv",
  ".avi",
  ".mov",
  ".flv",
  ".wma",
  ".mp3",
  ".ogg",
  ".aac",
  ".m4a",
  ".m4v",
  ".m4b",
  ".m4p",
  ".m4r",
  ".m4b",
  ".m4p",
  ".m4r",
];

type ScrapeResult = {
  error?: string;
  parseOutput: ParseOutput;
  statusCode: number;
};

function isSameHost(base: string, url: string) {
  const baseUrl = new URL(base);
  const urlObj = new URL(url);
  const normalizeHost = (host: string) => host.replace(/^www\./, "");
  return normalizeHost(baseUrl.host) === normalizeHost(urlObj.host);
}

export async function scrapeFetch(
  url: string
): Promise<{ text: string; statusCode: number }> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    "Sec-Ch-Ua":
      '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"macOS"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    Connection: "keep-alive",
    DNT: "1",
  };

  const response = await fetch(url, {
    headers,
    credentials: "same-origin",
    signal: AbortSignal.timeout(10000),
  });
  return { text: await response.text(), statusCode: response.status };
}

export async function scrape(
  url: string,
  options?: {
    dynamicFallbackContentLength?: number;
    removeHtmlTags?: string;
    scrollSelector?: string;
    maxWait?: number;
  }
): Promise<ScrapeResult> {
  const { dynamicFallbackContentLength = 100 } = options ?? {};
  let { text, statusCode } = await scrapeFetch(url);
  const parsedText = parseHtml(text, options);
  let error = undefined;

  if (parsedText.text.length <= dynamicFallbackContentLength) {
    try {
      const pwResult = await scrapePw(url, {
        scrollSelector: options?.scrollSelector,
        maxWait: options?.maxWait,
      });
      text = pwResult.text;
      statusCode = pwResult.statusCode;
    } catch (e: any) {
      console.log(e);
      error = e.message;
    }
  }

  return { parseOutput: parseHtml(text, options), error, statusCode };
}

export type ScrapeWithLinksOptions = {
  removeHtmlTags?: string;
  skipRegex?: RegExp[];
  onPreScrape?: (url: string) => Promise<void>;
  dynamicFallbackContentLength?: number;
  allowOnlyRegex?: RegExp;
  scrollSelector?: string;
  maxWait?: number;
};

export class StatusCodeError extends Error {
  code: number;
  constructor(code: number) {
    super(`Failed with status code: ${code}`);
    this.code = code;
  }
}

export async function scrapeWithLinks(
  url: string,
  baseUrl: string,
  options?: ScrapeWithLinksOptions
) {
  if (options?.onPreScrape) {
    options.onPreScrape(url);
  }
  const { parseOutput, statusCode } = await scrape(url, options);
  const { links: linkLinks, metaTags, text, markdown } = parseOutput;

  if (Math.floor(statusCode / 100) !== 2) {
    throw new StatusCodeError(statusCode);
  }

  const linksToScrape = new Set<string>();

  for (const link of linkLinks) {
    if (!link.href) continue;

    const linkUrl = new URL(link.href, url).toString();

    if (!linkUrl) {
      console.log("Invalid link", link.href);
      continue;
    }

    if (!isSameHost(baseUrl, linkUrl.toString())) {
      continue;
    }

    let linkUrlStr = linkUrl.toString();
    linkUrlStr = linkUrlStr.split("#")[0];

    if (options?.skipRegex?.some((regex) => regex.test(linkUrlStr))) {
      continue;
    }

    if (options?.allowOnlyRegex && !options.allowOnlyRegex.test(linkUrlStr)) {
      continue;
    }

    if (heavyFiles.some((file) => linkUrlStr.endsWith(file))) {
      continue;
    }

    linksToScrape.add(linkUrlStr);
  }

  return { text, markdown, links: linksToScrape, metaTags };
}
