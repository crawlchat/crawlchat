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

  async upsert(
    scrapeId: string,
    knowledgeGroupId: string,
    documents: IndexDocument[]
  ): Promise<void> {
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
            values: ((await this.makeEmbedding(document.text)) as any)[0]
              .values!,
            sparseValues: {
              indices: sparseData.data[0].sparse_indices,
              values: sparseData.data[0].sparse_values,
            },
            metadata: {
              ...document.metadata,
              scrapeId,
              id: document.id,
              knowledgeGroupId,
            },
          };
        })
      )
    );
  }

  private makeEmbedding(text: string) {
    return this.pinecone.inference.embed(this.denseModel, [text], {
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
}
