import { z } from "zod";
import { Agent } from "./agentic";
import { multiLinePrompt } from "./agentic";
import { Indexer } from "../indexer/indexer";
import { QueryResponse } from "@pinecone-database/pinecone";
import { RecordMetadata } from "@pinecone-database/pinecone";

export class RAGAgent extends Agent<
  {},
  { results: Record<string, QueryResponse<RecordMetadata>> }
> {
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
    ]);
  }

  getTools() {
    return {
      search_data: {
        description: multiLinePrompt([
          "Search the vector database for the most relevant documents.",
          "The query should be very short and should not be complex.",
          "Break the complex queries into smaller queries.",
          "Example: If the query is 'How to build a site and deploy it on Vercel?', break it into 'How to build a site' and 'Deploy it on Vercel'.",
          "Example: If the topic is about a tool called 'Remotion', turn the query 'What is it?' into 'What is Remotion?'",
          "These queries are for a vector database. Don't use extra words that do not add any value in vectorisation.",
          "Example: If the query is 'How to make a composition?', better you use 'make a composition'",
        ]),
        schema: z.object({
          queries: z.array(
            z.string({
              description: "The query to search the vector database with",
            })
          ),
        }),
        execute: async ({ queries }: { queries: string[] }) => {
          const results: Record<string, QueryResponse<RecordMetadata>> = {};
          for (const query of queries) {
            console.log("Searching RAG for", query);
            const result = await this.indexer.search(this.scrapeId, query, {
              topK: 2,
            });
            results[query] = result;
          }

          const content = Object.values(results)
            .map((r) => r.matches.map((m) => m.metadata!.content))
            .join("\n\n");

          return {
            content,
            customMessage: { results },
          };
        },
      },
    };
  }
}
