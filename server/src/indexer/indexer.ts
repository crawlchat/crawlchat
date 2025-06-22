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
  process(
    query: string,
    result: QueryResponse<RecordMetadata>
  ): Promise<
    {
      content: string;
      url: string;
      score: number;
      fetchUniqueId: string;
      id: string;
      scrapeItemId?: string;
      query?: string;
    }[]
  >;
}

export function randomFetchId() {
  const chars = "01234567890";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
