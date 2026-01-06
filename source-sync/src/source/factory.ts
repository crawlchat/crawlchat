import { KnowledgeGroupType } from "libs/dist/prisma";
import { WebSource } from "./web";
import { NotionSource } from "./notion";
import { GithubIssuesSource } from "./github-issues";

export function makeSource(type: KnowledgeGroupType) {
  switch (type) {
    case "scrape_web":
      return new WebSource();
    case "notion":
      return new NotionSource();
    case "github_issues":
      return new GithubIssuesSource();
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}
