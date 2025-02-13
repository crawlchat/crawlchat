import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "@huggingface/transformers";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

function makeIndexName(userId: string) {
  return `user-${userId}`;
}

function makeNamespaceName(scrapeId: string) {
  return `scrape-${scrapeId}`;
}

export async function makeEmbedding(text: string) {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return new Float32Array(output.data);
}

export async function createIndex(userId: string) {
  await pc.createIndex({
    name: makeIndexName(userId),
    dimension: 384,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
}

export async function saveEmbedding(
  userId: string,
  scrapeId: string,
  embedding: Float32Array<ArrayBuffer>,
  metadata: {
    content: string;
    url: string;
  }
) {
  const index = pc.index(makeIndexName(userId));
  await index.namespace(makeNamespaceName(scrapeId)).upsert([
    {
      id: uuidv4(),
      values: Array.from(embedding),
      metadata: { scrapeId, ...metadata },
    },
  ]);
}

export async function search(
  userId: string,
  scrapeId: string,
  queryEmbedding: Float32Array<ArrayBuffer>,
  options?: {
    topK?: number;
  }
) {
  const topK = options?.topK ?? 1;

  const index = pc.index(makeIndexName(userId));
  return await index.namespace(makeNamespaceName(scrapeId)).query({
    topK,
    vector: Array.from(queryEmbedding),
    includeMetadata: true,
  });
}
