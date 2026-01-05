import { Indexer } from "./indexer";
import { MarsIndexer } from "./mars-indexer";

export function makeIndexer({
  key,
  topN,
}: {
  key: string | null;
  topN?: number;
}): Indexer {
  const indexers = [new MarsIndexer()];
  const indexMap = new Map<string, Indexer>();
  for (const indexer of indexers) {
    indexMap.set(indexer.getKey(), indexer);
  }
  if (key && indexMap.has(key)) {
    return indexMap.get(key)!;
  }

  throw new Error(`Indexer with key ${key} not found`);
}
