import { EarthIndexer } from "./earth-indexer";
import { Indexer } from "./indexer";
import { MarsIndexer } from "./mars-indexer";

export function makeIndexer({
  key,
  topN,
}: {
  key: string | null;
  topN?: number;
}): Indexer {
  const defaultIndexer = new EarthIndexer();
  const indexers = [defaultIndexer, new MarsIndexer({ topN })];
  const indexMap = new Map<string, Indexer>();
  for (const indexer of indexers) {
    indexMap.set(indexer.getKey(), indexer);
  }
  if (key && indexMap.has(key)) {
    return indexMap.get(key)!;
  }

  return defaultIndexer;
}
