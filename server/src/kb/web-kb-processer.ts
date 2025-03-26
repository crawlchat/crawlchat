import { Scrape } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { scrapeLoop, ScrapeStore } from "../scrape/crawl";
import { OrderedSet } from "../scrape/ordered-set";
import { getMetaTitle } from "../scrape/parse";

export class WebKbProcesser extends BaseKbProcesser {
  constructor(
    protected listener: KbProcesserListener,
    private readonly scrape: Scrape,
    private readonly url: string,
    protected readonly options: {
      hasCredits: () => Promise<boolean>;
      removeHtmlTags?: string;
      dynamicFallbackContentLength?: number;
      limit?: number;
      skipRegex?: RegExp[];
      allowOnlyRegex?: RegExp;
    }
  ) {
    super(listener, options);
  }

  cleanUrl(url: string) {
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    return url.toLowerCase();
  }

  async process() {
    const url = this.url || this.scrape.url;
    if (!url) {
      throw new Error("No url provided");
    }

    const urlToScrape = this.cleanUrl(url);
    this.pathSet.add(urlToScrape);

    const store: ScrapeStore = {
      urls: {},
      urlSet: new OrderedSet(),
    };
    store.urlSet.add(urlToScrape);

    await scrapeLoop(store, urlToScrape, {
      removeHtmlTags: this.options.removeHtmlTags,
      dynamicFallbackContentLength: this.options.dynamicFallbackContentLength,
      limit: this.options.limit,
      skipRegex: this.options.skipRegex,
      allowOnlyRegex: this.options.allowOnlyRegex,
      onComplete: () => this.onComplete(),
      shouldScrape: () => this.options.hasCredits(),
      afterScrape: async (url, { markdown, error }) => {
        const metaTags = store.urls[url]?.metaTags ?? [];
        await this.onContentAvailable(url, {
          text: markdown,
          error,
          metaTags,
          title: getMetaTitle(metaTags),
        });
      },
    });
  }
}
