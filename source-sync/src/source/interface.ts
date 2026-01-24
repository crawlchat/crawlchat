import { Prisma } from "@packages/common/prisma";
import { GroupData, ItemData } from "./queue";

export type PageContent = {
  title: string;
  text: string;
};

export type UpdateItemResponse = {
  page?: PageContent;
};

export type GroupForSource = Prisma.KnowledgeGroupGetPayload<{
  include: {
    scrape: {
      include: {
        user: true;
      };
    };
  };
}>;

export type ItemForSource = Prisma.ScrapeItemGetPayload<{
  include: {
    knowledgeGroup: {
      include: {
        scrape: {
          include: {
            user: true;
          };
        };
      };
    };
  };
}>;

export interface Source {
  updateGroup: (jobData: GroupData, group: GroupForSource) => Promise<void>;
  updateItem: (
    jobData: ItemData,
    group: GroupForSource
  ) => Promise<UpdateItemResponse>;
}
