import { scrapeFetch } from "./scrape/crawl";
import * as cheerio from "cheerio";
import { z } from "zod";
import { SimpleAgent, SimpleTool } from "./llm/agentic";
import { Flow } from "./llm/flow";
import { getConfig } from "./llm/config";

const MAX_FETCH_CALLS = 10;

export async function extractSiteUseCase(url: string) {
  let normalizedUrl = url.trim();
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  const systemPrompt = `You are a helpful assistant that can extract the use case of a website.
Use the provided tool to fetch the URL and return the content.
Don't conclude the information without fetching the website and its content.
Don't fetch static files like images, videos, etc., from the website.
Fetch minimal pages from the website to get the required information.
Tranverse through other pages to get the required information.

CRITICAL: Only extract information that is explicitly mentioned in the fetched website content. 
Do NOT infer, guess, or make up any information. 
If a field is not mentioned in the content, set it to null or omit it (for optional fields).
Only set boolean fields to true if explicitly stated in the content.
Only include URLs if they are explicitly mentioned in the content.
You must respond with a JSON object matching the required schema.`;

  const { text: html } = await scrapeFetch(normalizedUrl);

  const $ = cheerio.load(html);
  $("script").remove();
  $("style").remove();
  $("noscript").remove();
  $("[class]").removeAttr("class");
  $("[style]").removeAttr("style");
  $("svg").remove();
  const content = $("html").html() ?? "no content";

  const llmConfig = getConfig("gemini_2_5_flash");

  const agent = new SimpleAgent({
    id: "site-use-case-agent",
    prompt: systemPrompt,
    schema: z.object({
      name: z.string({
        description:
          "The name of the website/product. Ex: Remotion, CrawlChat, Google, Facebook",
      }),
      description: z.string({ description: "The description of the website" }),
      faviconUrl: z
        .string({ description: "The favicon URL of the website" })
        .nullable(),
      githubUrl: z
        .string({
          description:
            "The GitHub repository URL of the app/product. It should belong to the website. Leave it empty if not available.",
        })
        .nullable(),
      isOpenSource: z.boolean({
        description: "Whether the website is open source",
      }),
      discordUrl: z
        .string({ description: "The Discord URL of the website" })
        .nullable(),
      slackUrl: z
        .string({ description: "The Slack URL of the website" })
        .nullable(),
      docsWebsiteUrl: z
        .string({
          description: "The docs website URL of the website",
        })
        .nullable(),
      youtubeChannelUrl: z
        .string({
          description:
            "The YouTube channel URL of the website if available. Leave it empty if not available.",
        })
        .nullable(),
      isSoftware: z.boolean({
        description: "Whether the website represents a software/SaaS product",
      }),
    }),
    maxTokens: 4096,
    ...llmConfig,
  });

  const flow = new Flow([agent], {
    messages: [
      {
        llmMessage: {
          role: "user",
          content: `Extract the required information for the website: ${normalizedUrl}`,
        },
      },
      {
        llmMessage: {
          role: "user",
          content,
        },
      },
    ],
  });

  flow.addNextAgents(["site-use-case-agent"]);

  while (await flow.stream()) {}

  const lastMessage = flow.getLastMessage();
  return JSON.parse(lastMessage?.llmMessage?.content as string);
}
