import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import { Indexer } from "./indexer";
import { IndexDocument } from "./indexer";

export class EarthIndexer implements Indexer {
  private pinecone: Pinecone;
  private indexName: string;
  private embedder: FeatureExtractionPipeline | null;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.indexName = "earth";
    this.embedder = null;
  }

  getKey(): string {
    return this.indexName;
  }

  getMinBestScore(): number {
    return 0.3;
  }

  async upsert(scrapeId: string, documents: IndexDocument[]): Promise<void> {
    if (documents.length === 0) {
      return;
    }
    const index = this.pinecone.index(this.indexName);
    await index.upsert(
      await Promise.all(
        documents.map(async (doc) => ({
          id: doc.id,
          values: Array.from(await this.makeEmbedding(doc.text)),
          metadata: {
            ...doc.metadata,
            scrapeId,
            id: doc.id,
          },
        }))
      )
    );
  }

  makeRecordId(scrapeId: string, id: string) {
    return `${scrapeId}-${id}`;
  }

  async getEmbedder() {
    if (!this.embedder) {
      this.embedder = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        {
          dtype: "fp16",
        }
      );
    }
    return this.embedder;
  }

  async makeEmbedding(text: string) {
    const embedder = await this.getEmbedder();
    const output = await embedder(text, {
      pooling: "mean",
      normalize: true,
    });
    return new Float32Array(output.data);
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
    return await index.query({
      topK,
      vector: Array.from(await this.makeEmbedding(query)),
      includeMetadata: true,
      filter,
    });
  }
}
