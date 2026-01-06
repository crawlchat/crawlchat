import { KnowledgeGroupType } from "libs/dist/prisma";
import { WebSource } from "./web";
import { NotionSource } from "./notion";

export function makeSource(type: KnowledgeGroupType) {
  switch (type) {
    case "scrape_web":
      return new WebSource();
    case "notion":
      return new NotionSource();
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}
