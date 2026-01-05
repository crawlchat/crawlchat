import { Prisma } from "libs/dist/prisma";
import { GroupData, ItemWebData } from "src/source/queue";

export type PageContent = {
  title: string;
  text: string;
};

export type ScrapeItemResponse = {
  page?: PageContent;
  itemIds?: string[];
};

export type GroupStartReponse = {
  itemIds: string[];
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
  updateGroup: (
    group: GroupForSource,
    jobData: GroupData
  ) => Promise<GroupStartReponse>;
  updateItem: (
    item: ItemForSource,
    jobData: ItemWebData
  ) => Promise<ScrapeItemResponse>;
}
