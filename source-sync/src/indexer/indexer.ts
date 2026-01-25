export type IndexDocument = {
  id: string;
  text: string;
  metadata: Record<string, string | number>;
};

export interface Indexer {
  getKey(): string;
  upsert(
    scrapeId: string,
    knowledgeGroupId: string,
    documents: IndexDocument[]
  ): Promise<void>;
}
