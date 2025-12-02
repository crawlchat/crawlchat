import { scrapeFetch } from "./scrape/crawl";
import * as cheerio from "cheerio";
import { z } from "zod";
import { SimpleAgent, SimpleTool } from "./llm/agentic";
import { Flow } from "./llm/flow";

const MAX_FETCH_CALLS = 10;

// Zod schema for validation
export const SiteUseCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  iconUrl: z.union([z.string().url(), z.null()]),
  githubUrl: z.union([z.string().url(), z.null()]),
  isOpenSource: z.boolean(),
  discordUrl: z.union([z.string().url(), z.null()]),
  docsWebsiteUrl: z.union([z.string().url(), z.null()]),
  guidesUrl: z.union([z.string().url(), z.null()]),
  youtubeChannelUrl: z.union([z.string().url(), z.null()]),
  isSoftware: z.boolean(),
});

export type SiteUseCaseResult = z.infer<typeof SiteUseCaseSchema>;

export type SiteUseCaseError = {
  error: string;
  code:
    | "INVALID_URL"
    | "FETCH_LIMIT_EXCEEDED"
    | "NO_RESPONSE"
    | "PARSE_ERROR"
    | "FETCH_ERROR";
};

/**
 * Extracts use case information from a website URL using Gemini 2.5 Pro.
 * Uses the fetch tool at most 10 times to gather information.
 *
 * @param url - The website URL to analyze
 * @returns Promise resolving to the extracted use case data or an error
 */
export async function extractSiteUseCase(
  url: string
): Promise<SiteUseCaseResult | SiteUseCaseError> {
  // Validate URL
  if (!url || typeof url !== "string") {
    return {
      error: "URL is required and must be a string",
      code: "INVALID_URL",
    };
  }

  // Normalize URL
  let normalizedUrl = url.trim();
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  try {
    // Validate URL format
    new URL(normalizedUrl);
  } catch {
    return {
      error: "Invalid URL format",
      code: "INVALID_URL",
    };
  }

  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    return {
      error: "GEMINI_API_KEY is not configured",
      code: "FETCH_ERROR",
    };
  }

  // Track fetch state
  let fetchCount = 0;
  const fetchedUrls = new Set<string>();

  // Create fetch tool with state tracking
  const fetchTool = new SimpleTool({
    id: "fetch-url",
    description:
      "Fetch the URL and return the content. Use this tool to get website content.",
    schema: z.object({
      url: z.string().describe("The URL to fetch."),
    }),
    execute: async (input) => {
      // Check fetch limit
      if (fetchCount >= MAX_FETCH_CALLS) {
        return {
          content: JSON.stringify({
            error: `Maximum fetch limit of ${MAX_FETCH_CALLS} has been reached`,
          }),
        };
      }

      const fetchUrl = input.url?.trim();
      if (!fetchUrl) {
        return {
          content: JSON.stringify({
            error: "URL parameter is missing",
          }),
        };
      }

      // Normalize and validate fetch URL
      let normalizedFetchUrl = fetchUrl;
      if (
        !normalizedFetchUrl.startsWith("http://") &&
        !normalizedFetchUrl.startsWith("https://")
      ) {
        try {
          // Try to resolve relative URL
          normalizedFetchUrl = new URL(
            normalizedFetchUrl,
            normalizedUrl
          ).toString();
        } catch {
          return {
            content: JSON.stringify({
              error: `Invalid URL format: ${fetchUrl}`,
            }),
          };
        }
      }

      // Check if we've already fetched this URL
      if (fetchedUrls.has(normalizedFetchUrl)) {
        return {
          content: JSON.stringify({
            error: "This URL has already been fetched",
          }),
        };
      }

      // Increment counter before fetching
      fetchCount++;
      fetchedUrls.add(normalizedFetchUrl);

      try {
        console.log(
          `[${fetchCount}/${MAX_FETCH_CALLS}] Fetching URL: ${normalizedFetchUrl}`
        );

        const { text: html } = await scrapeFetch(normalizedFetchUrl);

        // Clean HTML
        const $ = cheerio.load(html);
        $("script").remove();
        $("style").remove();
        $("noscript").remove();
        const cleanedHtml = $("html").html() || "";

        // Limit content size to avoid token limits (keep first 100k chars)
        const content =
          cleanedHtml.length > 100000
            ? cleanedHtml.substring(0, 100000) +
              "\n\n[Content truncated due to size]"
            : cleanedHtml;

        return { content };
      } catch (fetchError: any) {
        console.error(`Error fetching ${normalizedFetchUrl}:`, fetchError);
        return {
          content: JSON.stringify({
            error: `Failed to fetch URL: ${
              fetchError.message || "Unknown error"
            }`,
          }),
        };
      }
    },
  });

  const systemPrompt = `You are a helpful assistant that can extract the use case of a website.
Use the provided tool to fetch the URL and return the content.
Don't conclude the information without fetching the website and its content.
Don't fetch static files like images, videos, etc., from the website.
Fetch minimal pages from the website to get the required information.
You have a maximum of ${MAX_FETCH_CALLS} fetch operations available. Use them wisely.

CRITICAL: Only extract information that is explicitly mentioned in the fetched website content. 
Do NOT infer, guess, or make up any information. 
If a field is not mentioned in the content, set it to null or omit it (for optional fields).
Only set boolean fields to true if explicitly stated in the content.
Only include URLs if they are explicitly mentioned in the content.
You must respond with a JSON object matching the required schema.`;

  // Create agent with Gemini 2.5 Pro
  const agent = new SimpleAgent({
    id: "site-use-case-agent",
    prompt: systemPrompt,
    schema: SiteUseCaseSchema,
    tools: [fetchTool.make()],
    model: "gemini-2.5-pro",
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  // Create flow
  const flow = new Flow([agent], {
    messages: [
      {
        llmMessage: {
          role: "user",
          content: `Extract the required information for the website: ${normalizedUrl}`,
        },
      },
    ],
  });

  // Start the flow
  flow.addNextAgents(["site-use-case-agent"]);

  try {
    // Stream until completion
    while (await flow.stream()) {
      // Check if we've exceeded fetch limit during execution
      if (fetchCount > MAX_FETCH_CALLS) {
        return {
          error: `Maximum fetch limit of ${MAX_FETCH_CALLS} exceeded`,
          code: "FETCH_LIMIT_EXCEEDED",
        };
      }
    }

    // Get final response
    const lastMessage = flow.getLastMessage();
    const content = lastMessage?.llmMessage?.content;

    if (!content) {
      return {
        error: "No response text from model",
        code: "NO_RESPONSE",
      };
    }

    // Parse and validate response
    try {
      const parsed = JSON.parse(content as string);

      // Validate with Zod schema
      const validationResult = SiteUseCaseSchema.safeParse(parsed);

      if (!validationResult.success) {
        return {
          error: `Response validation failed: ${validationResult.error.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ")}`,
          code: "PARSE_ERROR",
        };
      }

      return validationResult.data;
    } catch (parseError: any) {
      return {
        error: `Failed to parse response: ${
          parseError.message || "Invalid JSON"
        }`,
        code: "PARSE_ERROR",
      };
    }
  } catch (error: any) {
    return {
      error: `Failed to execute flow: ${error.message || "Unknown error"}`,
      code: "FETCH_ERROR",
    };
  }
}
