import mongoose, {
  model,
  Document,
  Schema,
  type InferRawDocType,
  Model,
} from "mongoose";
import { OrderedSet } from "./ordered-set";
import type { ScrapeStore } from "./crawl";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import faiss from "faiss-node";

const storeCache = new Map<string, ScrapeStore>();
const indexCache = new Map<string, faiss.IndexFlatL2>();

type ScrapeStatus = "pending" | "scraping" | "done" | "error";

interface SchemaDocument extends Document {
  url: String;
  createdAt: Date;
  updatedAt: Date;
  status: ScrapeStatus;
}
const ScrapeSchema = new Schema({
  url: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  status: { type: String, required: true },
});
const Scrape = model("Scrape", ScrapeSchema);

export async function getScrapeByUrl(url: string) {
  return await Scrape.findOne({ url });
}

export async function getScrapeById(id: string) {
  return await Scrape.findById(id);
}

export async function createScrape(url: string) {
  const result = await Scrape.create({
    url,
    createdAt: new Date(),
    updatedAt: new Date(),
    urls: [],
    status: "pending",
  });

  return result.toObject();
}

export async function updateScrape(
  scrapeId: string,
  {
    status,
  }: {
    status?: ScrapeStatus;
  }
) {
  const update: Partial<SchemaDocument> = {};
  if (status) {
    update.status = status;
  }
  await Scrape.findByIdAndUpdate(scrapeId, update);
}

export async function saveStore(scrapeId: string, store: ScrapeStore) {
  const client = new S3Client({ region: "us-east-1" });
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `scrapes/${scrapeId}/store.json`,
      Body: JSON.stringify({
        urls: store.urls,
        urlSet: store.urlSet.values(),
      }),
    })
  );
  storeCache.set(scrapeId, store);
}

export async function loadStore(scrapeId: string): Promise<ScrapeStore | null> {
  const cached = storeCache.get(scrapeId);
  if (cached) {
    return cached;
  }

  const client = new S3Client({ region: "us-east-1" });
  const response = await client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `scrapes/${scrapeId}/store.json`,
    })
  );

  if (!response.Body) {
    return null;
  }

  const json = await response.Body.transformToString();
  const data = JSON.parse(json);

  const urlSet = new OrderedSet<string>();
  urlSet.fill(data.urlSet);

  const store = {
    urls: data.urls,
    urlSet,
  };

  storeCache.set(scrapeId, store);
  return store;
}

export async function saveIndex(scrapeId: string, index: faiss.IndexFlatL2) {
  const buffer = index.toBuffer();
  const client = new S3Client({ region: "us-east-1" });
  client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `scrapes/${scrapeId}/faiss.index`,
      Body: buffer,
    })
  );
  indexCache.set(scrapeId, index);
}

export async function loadIndex(
  scrapeId: string
): Promise<faiss.IndexFlatL2 | null> {
  const cached = indexCache.get(scrapeId);
  if (cached) {
    return cached;
  }

  const client = new S3Client({ region: "us-east-1" });
  const response = await client.send(
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `scrapes/${scrapeId}/faiss.index`,
    })
  );

  if (!response.Body) {
    return null;
  }

  const buffer = await response.Body.transformToByteArray();
  const index = await faiss.IndexFlatL2.fromBuffer(Buffer.from(buffer));
  indexCache.set(scrapeId, index);
  return index;
}
