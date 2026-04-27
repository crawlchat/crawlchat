import cn from "@meltdownjs/cn";
import { useState } from "react";
import { TbArrowRight } from "react-icons/tb";
import { useFetcher } from "react-router";
import { makeMeta } from "~/meta";
import type { Route } from "./+types/website-to-markdown";
import {
  Container,
  Heading,
  HeadingDescription,
  HeadingHighlight,
} from "./page";

export function meta() {
  return makeMeta({
    title:
      "Website to markdown — URL to markdown online & html to markdown tool",
    description:
      "Free website-to-markdown conversion: turn any public page into clean markdown. Url to markdown online with word count, timing, and link stats. Ideal when you need html to markdown from a live URL.",
  });
}

type MarkdownResponse = {
  url: string;
  title: string | null;
  markdown: string;
  truncated: boolean;
  plainText: string;
  wordCount: number;
  characterCount: number;
  linkCount: number;
  durationMs: number;
  httpStatus: number;
  dynamicScrapeError: string | null;
};

type ActionFailure = { error: string };

function isActionFailure(data: unknown): data is ActionFailure {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as ActionFailure).error === "string"
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const urlRaw = formData.get("url");
  if (!urlRaw || typeof urlRaw !== "string" || !urlRaw.trim()) {
    return { error: "Missing url" } satisfies ActionFailure;
  }

  const response = await fetch(
    `${process.env.VITE_SOURCE_SYNC_URL}/website-to-markdown`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: urlRaw.trim() }),
    }
  );

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Could not convert this URL.";
    return { error: message } satisfies ActionFailure;
  }

  return data as MarkdownResponse;
}

export default function WebsiteToMarkdownPage() {
  const fetcher = useFetcher<MarkdownResponse | ActionFailure>();
  const [pageUrl, setPageUrl] = useState("");

  const loading = fetcher.state !== "idle";
  const data = fetcher.data;
  const error = data !== undefined && isActionFailure(data) ? data.error : null;
  const result = data !== undefined && !isActionFailure(data) ? data : null;

  return (
    <Container>
      <div className="py-12 md:py-20">
        <Heading>
          Convert <HeadingHighlight>website to markdown</HeadingHighlight> for
          free
        </Heading>
        <HeadingDescription>
          Paste a public https URL to convert the page to markdown (html to
          markdown from a live address). See word count, characters, links, and
          how long conversion took — a simple way to turn webpage content into
          clean text for docs, RAG, or notes.
        </HeadingDescription>

        <fetcher.Form
          method="post"
          className={cn(
            "max-w-4xl mx-auto mt-8 gap-4",
            "flex flex-col md:flex-row"
          )}
        >
          <input
            type="url"
            name="url"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            placeholder="https://example.com/docs"
            className="input input-xl md:flex-1 w-full"
            required
          />
          <button
            type="submit"
            className="btn btn-primary btn-xl"
            disabled={loading}
          >
            {loading ? "Converting" : "Convert to markdown"}
            {!loading && <TbArrowRight />}
          </button>
        </fetcher.Form>

        {error && (
          <p className="max-w-4xl mx-auto mt-4 text-error" role="alert">
            {error}
          </p>
        )}

        {result && (
          <div className="max-w-4xl mx-auto mt-8 space-y-4">
            <div className="flex flex-wrap gap-4 text-sm text-base-content/80">
              <span>
                <strong className="text-base-content">Words:</strong>{" "}
                {result.wordCount.toLocaleString()}
              </span>
              <span>
                <strong className="text-base-content">Characters:</strong>{" "}
                {result.characterCount.toLocaleString()}
              </span>
              <span>
                <strong className="text-base-content">Links found:</strong>{" "}
                {result.linkCount.toLocaleString()}
              </span>
              <span>
                <strong className="text-base-content">Time:</strong>{" "}
                {(result.durationMs / 1000).toFixed(2)}s
              </span>
              <span>
                <strong className="text-base-content">HTTP:</strong>{" "}
                {result.httpStatus}
              </span>
              {result.title && (
                <span className="w-full md:w-auto">
                  <strong className="text-base-content">Title:</strong>{" "}
                  {result.title}
                </span>
              )}
            </div>
            {result.truncated && (
              <p className="text-sm text-warning">
                Output was truncated for size. Use the CrawlChat app for full
                site ingestion and a stable url to markdown workflow on your own
                collections.
              </p>
            )}
            {result.dynamicScrapeError && (
              <p className="text-sm text-base-content/70">
                Dynamic render note: {result.dynamicScrapeError}
              </p>
            )}
            <textarea
              readOnly
              value={result.markdown}
              className="textarea textarea-bordered w-full min-h-[320px] font-mono text-sm"
              aria-label="Markdown output"
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto mt-16 grid gap-6">
          <section className="border border-base-300 rounded-box p-6">
            <h2 className="text-2xl font-brand">Url to markdown online</h2>
            <p className="mt-3 text-base-content/80">
              This page is built for teams that search for url to markdown, html
              to markdown, or website-to-markdown tools without running scripts
              locally. You get structured markdown plus basic stats so you can
              compare pages or paste into your editor. For automated url to
              markdown api access and private sources, use CrawlChat collections
              and integrations after you sign in.
            </p>
          </section>

          <section className="border border-base-300 rounded-box p-6">
            <h2 className="text-2xl font-brand">
              Html to markdown from any page
            </h2>
            <p className="mt-3 text-base-content/80">
              We extract the main readable content where possible and convert it
              to markdown, similar to popular html to markdown workflows.
              Tables, headings, and links are preserved so the result is usable
              in Notion-style docs, static site generators, or AI context packs.
            </p>
          </section>

          <section className="border border-base-300 rounded-box p-6">
            <h2 className="text-2xl font-brand">
              When to use website to markdown
            </h2>
            <ul className="mt-3 list-disc list-inside text-base-content/80 space-y-2">
              <li>
                Quickly preview how a help article or changelog reads as
                markdown.
              </li>
              <li>
                Estimate word count and complexity before adding a site to your
                knowledge base.
              </li>
              <li>
                Copy clean text from a single public URL when you do not need a
                full crawl.
              </li>
            </ul>
          </section>

          <section className="border border-base-300 rounded-box p-6">
            <h2 className="text-2xl font-brand">FAQ</h2>
            <div className="mt-3 space-y-4 text-base-content/80">
              <div>
                <h3 className="font-medium">
                  Is this the same as a url to markdown API?
                </h3>
                <p>
                  This form posts to CrawlChat, which forwards the request to
                  our conversion service and returns JSON with markdown and
                  metrics. For production url to markdown api usage with
                  authentication, rate limits per key, and collection storage,
                  use CrawlChat after you create an account.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Can I convert any website?</h3>
                <p>
                  Only public http(s) URLs that are allowed by our safety rules.
                  Respect the site&apos;s terms and robots guidance. We block
                  obvious private-network targets.
                </p>
              </div>
              <div>
                <h3 className="font-medium">
                  Why are some pages short or empty?
                </h3>
                <p>
                  Heavy client-rendered apps may need a full crawl inside
                  CrawlChat. If the fetch step cannot see the same content as
                  your browser, try our in-app scraping or connectors.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
