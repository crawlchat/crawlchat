import { ApiActionCall } from "@prisma/client";

export type CustomMessage = {
  result?: {
    id: string;
    content: string;
    url?: string;
    score: number;
    scrapeItemId?: string;
    fetchUniqueId?: string;
    query?: string;
  }[];
  actionCall?: ApiActionCall;
};
