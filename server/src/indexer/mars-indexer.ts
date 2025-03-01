import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import { Indexer } from "./indexer";
import { IndexDocument } from "./indexer";

export class MarsIndexer implements Indexer {
  private pinecone: Pinecone;
  private indexName: string;
  private denseModel: string;
  private sparseModel: string;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.indexName = "mars";
    this.denseModel = "multilingual-e5-large";
    this.sparseModel = "pinecone-sparse-english-v0";
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
}
