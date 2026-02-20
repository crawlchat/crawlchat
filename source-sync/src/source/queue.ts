import { Queue } from "bullmq";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;
const useRedisCluster = process.env.REDIS_CLUSTER === "true";
const parsedRedisUrl = new URL(redisUrl);
const isTls = parsedRedisUrl.protocol === "rediss:";
const redisHost = parsedRedisUrl.hostname;
const redisPort = parsedRedisUrl.port ? Number(parsedRedisUrl.port) : 6379;
export const BULLMQ_PREFIX = "{bull}";

const redisOptions = {
  maxRetriesPerRequest: null,
  family: 0,
  ...(isTls && {
    tls: {},
  }),
};

export const redis = useRedisCluster
  ? new Redis.Cluster([{ host: redisHost, port: redisPort }], {
      dnsLookup: (address, callback) => callback(null, address),
      redisOptions,
    })
  : new Redis(redisUrl, redisOptions);

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
  prefix: BULLMQ_PREFIX,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
});

export const itemQueue = new Queue<ItemData>(ITEM_QUEUE_NAME, {
  connection: redis,
  prefix: BULLMQ_PREFIX,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});
