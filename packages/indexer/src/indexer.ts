import { RecordMetadata, QueryResponse } from "@pinecone-database/pinecone";

export type IndexDocument = {
  id: string;
  text: string;
  metadata: Record<string, string | number>;
};

export interface Indexer {
  getKey(): string;
  search(
    scrapeId: string,
    query: string,
    options?: { topK?: number; excludeIds?: string[] }
  ): Promise<QueryResponse<RecordMetadata>>;
  getMinBestScore(): number;
  makeRecordId(scrapeId: string, id: string): string;
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
  upsert(
    scrapeId: string,
    knowledgeGroupId: string,
    documents: IndexDocument[]
  ): Promise<void>;
  deleteScrape(scrapeId: string): Promise<void>;
  deleteByIds(ids: string[]): Promise<void>;
}
