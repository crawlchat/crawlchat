import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";
import { fetchYouTubeVideoData } from "./youtube-kb-processer";

type ChannelInfo = {
  id: string;
  url: string;
  handle: string;
  title: string;
};

type ChannelVideoItem = {
  id: string;
  thumbnail: string;
  type: string;
  title: string;
  description: string;
  commentCountText: string;
  commentCountInt: number;
  likeCountText: string;
  likeCountInt: number;
  viewCountText: string;
  viewCountInt: number;
  publishDateText: string;
  publishDate: string;
  channel: ChannelInfo;
  durationMs: number;
  durationFormatted: string;
  keywords?: string[];
  url: string;
};

type ChannelVideosResponse = {
  videos: ChannelVideoItem[];
  nextPageToken?: string;
};

function extractChannelIdOrHandle(channelUrl: string): {
  channelId?: string;
  handle?: string;
} {
  try {
    const url = new URL(channelUrl);
    const pathname = url.pathname;

    // Handle different YouTube URL formats:
    // https://www.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ
    // https://www.youtube.com/@handle
    // https://www.youtube.com/c/channelname
    // https://youtube.com/user/username

    if (pathname.startsWith("/channel/")) {
      const channelId = pathname.split("/channel/")[1]?.split("/")[0];
      if (channelId) {
        return { channelId };
      }
    } else if (pathname.startsWith("/@")) {
      const handle = pathname.split("/@")[1]?.split("/")[0];
      if (handle) {
        return { handle };
      }
    } else if (pathname.startsWith("/c/")) {
      const handle = pathname.split("/c/")[1]?.split("/")[0];
      if (handle) {
        return { handle };
      }
    } else if (pathname.startsWith("/user/")) {
      const handle = pathname.split("/user/")[1]?.split("/")[0];
      if (handle) {
        return { handle };
      }
    }

    // If it's already a channel ID (starts with UC-)
    if (channelUrl.startsWith("UC-") || channelUrl.match(/^UC[a-zA-Z0-9_-]{22}$/)) {
      return { channelId: channelUrl };
    }

    // If it's a handle (starts with @)
    if (channelUrl.startsWith("@")) {
      return { handle: channelUrl.substring(1) };
    }

    return { handle: channelUrl };
  } catch {
    // If URL parsing fails, assume it's a channel ID or handle
    if (channelUrl.startsWith("UC-") || channelUrl.match(/^UC[a-zA-Z0-9_-]{22}$/)) {
      return { channelId: channelUrl };
    }
    if (channelUrl.startsWith("@")) {
      return { handle: channelUrl.substring(1) };
    }
    return { handle: channelUrl };
  }
}

async function fetchChannelVideos(
  channelUrl: string,
  limit?: number
): Promise<ChannelVideoItem[]> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPECREATORS_API_KEY environment variable is not set.");
  }

  const { channelId, handle } = extractChannelIdOrHandle(channelUrl);

  const apiUrl = new URL("https://api.scrapecreators.com/v1/youtube/channel-videos");

  if (channelId) {
    apiUrl.searchParams.append("channelId", channelId);
  } else if (handle) {
    apiUrl.searchParams.append("handle", handle);
  } else {
    throw new Error("Invalid channel URL. Must be a channel ID, handle, or YouTube channel URL.");
  }

  const allVideos: ChannelVideoItem[] = [];
  let nextPageToken: string | undefined;
  let pageCount = 0;
  const maxPages = 10;

  do {
    if (nextPageToken) {
      apiUrl.searchParams.set("pageToken", nextPageToken);
    }

    pageCount++;

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch channel videos: ${response.status} ${response.statusText}`;

      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;

      throw new Error(errorMessage);
    }

    const data: ChannelVideosResponse = await response.json();

    if (!data || !data.videos) {
      break;
    }

    allVideos.push(...data.videos);

    if (limit && allVideos.length >= limit) {
      allVideos.splice(limit);
      break;
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken && pageCount < maxPages);

  return allVideos;
}

export class YoutubeChannelKbProcesser extends BaseKbProcesser {
  constructor(
    protected listener: KbProcesserListener,
    private readonly knowledgeGroup: KnowledgeGroup
  ) {
    super(listener);
  }

  async process() {
    const channelUrl = this.knowledgeGroup.url;

    if (!channelUrl) {
      throw new Error("YouTube channel URL is required");
    }

    const maxPages = this.knowledgeGroup.maxPages ?? 5000;
    const videos = await fetchChannelVideos(channelUrl, maxPages);

    if (videos.length === 0) {
      throw new Error("No videos found for this channel");
    }

    // Filter videos based on skipPageRegex (used as skipUrls for YouTube channels)
    const skipRegexes = (
      this.knowledgeGroup.skipPageRegex?.split(",") ?? []
    ).filter(Boolean);
    
    const filteredVideos = videos.filter((video) => {
      if (skipRegexes.length === 0) {
        return true;
      }
      return !skipRegexes.some((regex) => {
        const r = new RegExp(regex.trim());
        return r.test(video.url) || r.test(video.id) || r.test(video.title);
      });
    });

    if (filteredVideos.length === 0) {
      throw new Error("No videos found after applying skip filters");
    }

    for (const video of filteredVideos) {
      try {
        const { transcript, title } = await fetchYouTubeVideoData(video.url);

        if (!transcript || transcript.trim().length === 0) {
          await this.onError(
            video.url,
            new Error("No transcript available for this video")
          );
          continue;
        }

        await this.onContentAvailable(video.url, {
          text: transcript,
          title: title,
        });
      } catch (error) {
        await this.onError(
          video.url,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }
}

