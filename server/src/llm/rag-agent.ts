import { z } from "zod";
import { Agent } from "./agentic";
import { multiLinePrompt } from "./agentic";
import { Indexer } from "../indexer/indexer";

export type RAGAgentCustomMessage = {
  result?: {
    content: string;
    url?: string;
    score: number;
    scrapeItemId?: string;
  }[];
};

export type RAGState = {};

export class RAGAgent extends Agent<RAGState, RAGAgentCustomMessage> {
  private indexer: Indexer;
  private scrapeId: string;

  constructor(indexer: Indexer, scrapeId: string) {
    super();
    this.indexer = indexer;
    this.scrapeId = scrapeId;
  }

  async getSystemPrompt() {
    return multiLinePrompt([
      "You are a helpful assistant that can answer questions about the context provided.",
      "Use the search_data tool to search the vector database for the relavent information.",
      "You can run search_data tool multiple times to get more information.",
      "Don't hallucinate. You cannot add new topics to the query. It should be inside the context of the query.",
      "The query should be very short and should not be complex.",
      "Break the complex queries into smaller queries.",
      "Example: If the query is 'How to build a site and deploy it on Vercel?', break it into 'How to build a site' and 'Deploy it on Vercel'.",
      "Example: If the topic is about a tool called 'Remotion', turn the query 'What is it?' into 'What is Remotion?'",
      "These queries are for a vector database. Don't use extra words that do not add any value in vectorisation.",
      "Example: If the query is 'How to make a composition?', better you use 'make a composition'",
      "The query should not be more than 3 words. Keep only the most important words.",
      "Don't repeat the same or similar queries.",
    ]);
  }

  getTools() {
    return {
      search_data: {
        description: multiLinePrompt([
          "Search the vector database for the most relevant documents.",
        ]),
        schema: z.object({
          query: z.string({
            description: "The query to search the vector database with",
          }),
        }),
        execute: async ({ query }: { query: string }) => {
          console.log("Searching RAG for -", query);
          const result = await this.indexer.search(this.scrapeId, query, {
            topK: 20,
          });

          let processed = await this.indexer.process(query, result);
          processed = processed.filter((r) => r.score >= 0.1);

          return {
            content: processed.map((r) => r.content).join("\n\n"),
            customMessage: {
              result: processed,
            },
          };
        },
      },
    };
  }
}

export class Answerer extends Agent<{}, RAGAgentCustomMessage> {
  private query: string;

  constructor(query: string) {
    super();
    this.query = query;
  }

  async getSystemPrompt() {
    console.log("Answering", this.query);
    return multiLinePrompt([
      `Given above context, answer the query "${this.query}".`,
    ]);
  }
}
