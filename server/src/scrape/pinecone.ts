import { Pinecone } from "@pinecone-database/pinecone";
import {
  pipeline,
  AutoTokenizer,
  FeatureExtractionPipeline,
} from "@huggingface/transformers";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

let embedder: FeatureExtractionPipeline;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      dtype: "fp16",
    });
  }
  return embedder;
}

function makeIndexName() {
  return "earth";
}

export function makeRecordId(scrapeId: string, id: string) {
  return `${scrapeId}/${id}`;
}

export async function makeEmbedding(text: string) {
  const embedder = await getEmbedder();
  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });
  return new Float32Array(output.data);
}

export async function saveEmbedding(
  scrapeId: string,
  docs: {
    embedding: Float32Array<ArrayBuffer>;
    metadata: {
      content: string;
      url: string;
    };
    id: string;
  }[]
) {
  if (docs.length === 0) {
    return;
  }
  const index = pc.index(makeIndexName());
  await index.upsert(
    docs.map((doc) => ({
      id: doc.id,
      values: Array.from(doc.embedding),
      metadata: {
        ...doc.metadata,
        scrapeId,
        id: doc.id,
      },
    }))
  );
}

export async function search(
  scrapeId: string,
  queryEmbedding: Float32Array<ArrayBuffer>,
  options?: {
    topK?: number;
    excludeIds?: string[];
  }
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

  const index = pc.index(makeIndexName());
  return await index.query({
    topK,
    vector: Array.from(queryEmbedding),
    includeMetadata: true,
    filter,
  });
}

export async function deleteScrape(scrapeId: string) {
  const index = pc.index(makeIndexName());

  let page;

  do {
    page = await index.listPaginated({
      prefix: scrapeId,
      paginationToken: page?.pagination?.next,
    });
    const ids = page.vectors?.map((vector) => vector.id) ?? [];

    if (ids.length === 0) {
      break;
    }

    await index.deleteMany(ids);
  } while (page.pagination?.next);
}

export async function deleteByIds(ids: string[]) {
  if (ids.length === 0) {
    return;
  }
  const index = pc.index(makeIndexName());
  await index.deleteMany(ids);
}
