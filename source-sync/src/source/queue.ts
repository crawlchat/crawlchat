import { Queue } from "bullmq";
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {
    rejectUnauthorized: false,
  },
});

export const GROUP_QUEUE_NAME = process.env.GROUP_QUEUE_NAME!;
export const ITEM_QUEUE_NAME = process.env.ITEM_QUEUE_NAME!;

export type GroupData = {
  knowledgeGroupId: string;
  scrapeId: string;
  userId: string;
  processId: string;
  cursor?: string;
};

export type ItemData = {
  knowledgeGroupId: string;
  processId: string;
  url: string;
  sourcePageId: string;

  justThis?: boolean;
  textPage?: {
    title: string;
    text: string;
  };
  cursor?: string;
};

export const groupQueue = new Queue<GroupData>(GROUP_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export const itemQueue = new Queue<ItemData>(ITEM_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
