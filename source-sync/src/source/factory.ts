import { KnowledgeGroupType } from "libs/dist/prisma";
import { WebSource } from "./web";
import { NotionSource } from "./notion";
import { GithubIssuesSource } from "./github-issues";
import { TextSource } from "./text";
import { ConfluenceSource } from "./confluence";
import { LinearIssuesSource } from "./linear";
import { YoutubeChannelSource } from "./youtube-channel";
import { YoutubeVideosSource } from "./youtube-videos";

export function makeSource(type: KnowledgeGroupType) {
  switch (type) {
    case "scrape_web":
      return new WebSource();
    case "notion":
      return new NotionSource();
    case "github_issues":
      return new GithubIssuesSource();
    case "upload":
      return new TextSource();
    case "confluence":
      return new ConfluenceSource();
    case "linear":
      return new LinearIssuesSource();
    case "youtube_channel":
      return new YoutubeChannelSource();
    case "youtube":
      return new YoutubeVideosSource();
    default:
      throw new Error(`Unknown source type: ${type}`);
  }
}
