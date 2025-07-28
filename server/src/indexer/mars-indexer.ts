import {
  Pinecone,
  RecordMetadata,
  QueryResponse,
} from "@pinecone-database/pinecone";
import { Indexer, randomFetchId } from "./indexer";
import { IndexDocument } from "./indexer";

export class MarsIndexer implements Indexer {
  private pinecone: Pinecone;
  private indexName: string;
  private denseModel: string;
  private sparseModel: string;
  private topN: number;

  constructor({ topN }: { topN?: number }) {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.indexName = "mars";
    this.denseModel = "multilingual-e5-large";
    this.sparseModel = "pinecone-sparse-english-v0";
    this.topN = topN ?? 4;
  }

  getKey(): string {
    return this.indexName;
  }

  getMinBestScore(): number {
    return 10;
  }

  async upsert(scrapeId: string, documents: IndexDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }
    const index = this.pinecone.index(this.indexName);
    await index.upsert(
      await Promise.all(
        documents.map(async (document) => {
          const sparseData = await this.makeSparseEmbedding(document.text);

          return {
            id: document.id,
            values: (await this.makeEmbedding(document.text))[0].values!,
            sparseValues: {
              indices: sparseData.data[0].sparse_indices,
              values: sparseData.data[0].sparse_values,
            },
            metadata: {
              ...document.metadata,
              scrapeId,
              id: document.id,
            },
          };
        })
      )
    );
  }

  makeRecordId(scrapeId: string, id: string) {
    return `${scrapeId}-${id}`;
  }

  async makeEmbedding(text: string) {
    return await this.pinecone.inference.embed(this.denseModel, [text], {
      inputType: "passage",
      truncate: "END",
    });
  }

  async makeSparseEmbedding(text: string) {
    const response = await fetch("https://api.pinecone.io/embed", {
      method: "POST",
      headers: {
        "Api-Key": process.env.PINECONE_API_KEY!,
        "Content-Type": "application/json",
        "X-Pinecone-API-Version": "2025-01",
      },
      body: JSON.stringify({
        model: this.sparseModel,
        parameters: {
          input_type: "passage",
        },
        inputs: [
          {
            text: text,
          },
        ],
      }),
    });
    return await response.json();
  }

  async search(
    scrapeId: string,
    query: string,
    options?: { topK?: number; excludeIds?: string[] }
  ) {
    const topK = options?.topK ?? 5;

    const filter: Record<string, any> = {
      scrapeId,
    };

    if (options?.excludeIds) {
      filter.id = {
        $nin: options.excludeIds,
      };
    }

    const index = this.pinecone.index(this.indexName);

    const queryEmbedding = await this.makeEmbedding(query);
    const querySparseEmbedding = await this.makeSparseEmbedding(query);
    const queryResponse = await index.query({
      topK,
      vector: queryEmbedding[0].values!,
      sparseVector: {
        indices: querySparseEmbedding.data[0].sparse_indices,
        values: querySparseEmbedding.data[0].sparse_values,
      },
      includeValues: false,
      includeMetadata: true,
      filter,
    });

    return queryResponse;
  }

  async process(query: string, result: QueryResponse<RecordMetadata>) {
    if (result.matches.length === 0) {
      return [];
    }

    const rerank = await this.pinecone.inference.rerank(
      "bge-reranker-v2-m3",
      query,
      result.matches.map((m) => ({
        id: m.id,
        text: m.metadata!.content as string,
        url: m.metadata!.url as string,
        scrapeItemId: m.metadata!.scrapeItemId as string,
      })),
      {
        topN: this.topN,
        returnDocuments: true,
        parameters: {
          truncate: "END",
        },
      }
    );

    return rerank.data.map((r) => ({
      content: r.document!.text,
      url: r.document!.url,
      score: r.score,
      scrapeItemId: r.document!.scrapeItemId,
      fetchUniqueId: randomFetchId(),
      id: r.document!.id,
      query,
    }));
  }
}
