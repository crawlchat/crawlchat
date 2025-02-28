import { EarthIndexer } from "./earth-indexer";
import { Indexer } from "./indexer";
import { MarsIndexer } from "./mars-indexer";

export function makeIndexer({ key }: { key?: string }): Indexer {
  const indexers = [new EarthIndexer(), new MarsIndexer()];
  const indexMap = new Map<string, Indexer>();
  for (const indexer of indexers) {
    indexMap.set(indexer.getKey(), indexer);
  }
  if (key && indexMap.has(key)) {
    return indexMap.get(key)!;
  }

  return indexers[0];
}
