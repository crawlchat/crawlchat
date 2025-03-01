import { RecordMetadata, QueryResponse } from "@pinecone-database/pinecone";

export type IndexDocument = {
  id: string;
  text: string;
  metadata: Record<string, string | number>;
};

export interface Indexer {
  getKey(): string;
  upsert(scrapeId: string, documents: IndexDocument[]): Promise<void>;
  search(
    scrapeId: string,
    query: string,
    options?: { topK?: number; excludeIds?: string[] }
  ): Promise<QueryResponse<RecordMetadata>>;
  getMinBestScore(): number;
}
