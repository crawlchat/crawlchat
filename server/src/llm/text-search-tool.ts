import { multiLinePrompt } from "@packages/agentic";
import { prisma } from "@packages/common/prisma";
import { z } from "zod";

const DEFAULT_SNIPPET_WINDOW = 80;
const MAX_REGEX_LENGTH = 200;
const MAX_RESULTS = 20;
const DEFAULT_MAX_CALLS = 3;

type ItemDocument = {
  _id: { $oid: string };
  markdown?: string | null;
  url?: string | null;
  score?: number;
};

function snippetAround(
  text: string | null | undefined,
  matchStart: number,
  matchLength: number,
  windowChars: number
): string | null {
  if (!text) return null;
  const start = Math.max(0, matchStart - windowChars);
  const end = Math.min(text.length, matchStart + matchLength + windowChars);
  const slice = text.slice(start, end).replace(/\s+/g, " ").trim();
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${slice}${suffix}`;
}

function snippetForPhrase(
  text: string | null | undefined,
  searchPhrase: string,
  windowChars: number
): string | null {
  if (!text || !searchPhrase) return null;
  const lower = text.toLowerCase();
  const term = searchPhrase.toLowerCase();
  const idx = lower.indexOf(term);
  if (idx === -1) return null;
  return snippetAround(text, idx, term.length, windowChars);
}

function snippetForRegex(
  text: string | null | undefined,
  regex: string,
  windowChars: number
): string | null {
  if (!text || !regex) return null;
  const re = new RegExp(regex, "i");
  const match = re.exec(text);
  if (!match) return null;
  return snippetAround(text, match.index, match[0].length, windowChars);
}

export type TextSearchToolContext = {
  callCount: number;
};

function checkLimitAndIncrement(
  context: TextSearchToolContext,
  maxCalls: number
) {
  if (context.callCount >= maxCalls) {
    return "Fallback text search limit reached. Frame your answer from the context you have.";
  }
  context.callCount += 1;
}

function buildResultList(
  rawResults: ItemDocument[],
  getSnippet: (markdown: string | null) => string | null
): { url: string; content: string; fetchUniqueId: string }[] {
  const list: { url: string; content: string; fetchUniqueId: string }[] = [];
  for (const doc of rawResults) {
    if (!doc.markdown) continue;
    const snippet = getSnippet(doc.markdown);
    const content =
      snippet ?? doc.markdown.slice(0, 200).replace(/\s+/g, " ").trim() + "…";
    list.push({ url: doc.url ?? "", content, fetchUniqueId: doc._id.$oid });
  }
  return list;
}

export function makeTextSearchTool(
  scrapeId: string,
  options?: {
    maxCalls?: number;
    textSearchContext?: TextSearchToolContext;
  }
) {
  const context = options?.textSearchContext ?? { callCount: 0 };
  const maxCalls = options?.maxCalls ?? DEFAULT_MAX_CALLS;

  return {
    id: "text_search",
    description: multiLinePrompt([
      "Fallback phrase search over the knowledge base. Use ONLY when search_data has already been used and returned no or insufficient results.",
      "Use snippetWindow to control how many characters of context appear before and after each match (default 80).",
      "Use this tool sparingly; prefer search_data first.",
    ]),
    schema: z.object({
      searchPhrase: z.string({
        description: "Phrase to search for",
      }),
      snippetWindow: z
        .number()
        .optional()
        .describe(
          "Number of characters before and after the match to include in the snippet (default 80)"
        ),
    }),
    execute: async ({
      searchPhrase,
      snippetWindow = DEFAULT_SNIPPET_WINDOW,
    }: {
      searchPhrase: string;
      snippetWindow?: number;
    }) => {
      console.log("[text_search] called with:", {
        searchPhrase,
        snippetWindow,
      });
      const limitMsg = checkLimitAndIncrement(context, maxCalls);
      if (limitMsg) return { content: limitMsg };

      const windowChars = Math.min(Math.max(0, snippetWindow), 500);

      const rawResults = (await prisma.scrapeItem.findRaw({
        filter: {
          $text: { $search: searchPhrase.toLowerCase() },
          scrapeId: { $oid: scrapeId },
        },
        options: {
          projection: {
            markdown: 1,
            url: 1,
            score: { $meta: "textScore" },
          },
          limit: MAX_RESULTS,
        },
      })) as unknown as ItemDocument[];

      const list = buildResultList(rawResults, (markdown) =>
        snippetForPhrase(markdown, searchPhrase, windowChars)
      );

      const contextStr = JSON.stringify(list);
      return {
        content:
          list.length > 0
            ? `<context>\n${contextStr}\n</context>`
            : "No matches from text search. Do not rely on this for the answer.",
      };
    },
  };
}

export function makeTextSearchRegexTool(
  scrapeId: string,
  options?: {
    maxCalls?: number;
    textSearchContext?: TextSearchToolContext;
  }
) {
  const context = options?.textSearchContext ?? { callCount: 0 };
  const maxCalls = options?.maxCalls ?? DEFAULT_MAX_CALLS;

  return {
    id: "text_search_regex",
    description: multiLinePrompt([
      "Fallback regex search over the knowledge base. Use ONLY when search_data has already been used and returned no or insufficient results.",
      "Use snippetWindow to control how many characters of context appear before and after each match (default 80).",
      "Use this tool sparingly; prefer search_data first.",
    ]),
    schema: z.object({
      searchRegex: z
        .string()
        .max(MAX_REGEX_LENGTH)
        .describe("Regex pattern for matching (case-insensitive)"),
      snippetWindow: z
        .number()
        .optional()
        .describe(
          "Number of characters before and after the match to include in the snippet (default 80)"
        ),
    }),
    execute: async ({
      searchRegex,
      snippetWindow = DEFAULT_SNIPPET_WINDOW,
    }: {
      searchRegex: string;
      snippetWindow?: number;
    }) => {
      console.log("[text_search_regex] called with:", {
        searchRegex,
        snippetWindow,
      });
      const limitMsg = checkLimitAndIncrement(context, maxCalls);
      if (limitMsg) return { content: limitMsg };

      const windowChars = Math.min(Math.max(0, snippetWindow), 500);

      const rawResults = (await prisma.scrapeItem.findRaw({
        filter: {
          scrapeId: { $oid: scrapeId },
          markdown: { $regex: searchRegex, $options: "i" },
        },
        options: {
          projection: { markdown: 1, url: 1 },
          limit: MAX_RESULTS,
        },
      })) as unknown as ItemDocument[];

      const list = buildResultList(rawResults, (markdown) =>
        snippetForRegex(markdown, searchRegex, windowChars)
      );

      const contextStr = JSON.stringify(list);
      return {
        content:
          list.length > 0
            ? `<context>\n${contextStr}\n</context>`
            : "No matches from text search regex. Do not rely on this for the answer.",
      };
    },
  };
}
