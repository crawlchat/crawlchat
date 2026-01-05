import { Queue } from "bullmq";
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const GROUP_QUEUE_NAME = "group";
export const ITEM_QUEUE_NAME = "item";

export type GroupData = {
  knowledgeGroupId: string;
  scrapeId: string;
  userId: string;
  processId: string;
};

export type ItemWebData = {
  scrapeItemId: string;
  processId: string;
  justThis?: boolean;
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

export const itemQueue = new Queue<ItemWebData>(
  ITEM_QUEUE_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  }
);