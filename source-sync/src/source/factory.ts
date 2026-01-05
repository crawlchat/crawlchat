import { KnowledgeGroupType } from "libs/dist/prisma";
import { WebSource } from "./web";

export function makeSource(type: KnowledgeGroupType) {
  switch (type) {
    case "scrape_web":
      return new WebSource();
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}
