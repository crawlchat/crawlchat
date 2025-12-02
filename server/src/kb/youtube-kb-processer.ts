import { KnowledgeGroup } from "libs/prisma";
import { BaseKbProcesser, KbProcesserListener } from "./kb-processer";

type ChannelInfo = {
  id: string;
  url: string;
  handle: string;
  title: string;
};

type TranscriptItem = {
  text: string;
  startMs: string;
  endMs: string;
  startTimeText: string;
};

type ScrapeCreatorsVideoResponse = {
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
  transcript?: TranscriptItem[];
  transcript_only_text?: string;
};

interface YouTubeVideoData {
  transcript: string;
  title: string;
}

async function fetchYouTubeVideoData(
  videoUrl: string
): Promise<YouTubeVideoData> {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPECREATORS_API_KEY environment variable is not set.");
  }

  const apiUrl = new URL("https://api.scrapecreators.com/v1/youtube/video");
  apiUrl.searchParams.append("url", videoUrl);
  apiUrl.searchParams.append("get_transcript", "true");

  const response = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to fetch video data: ${response.status} ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If parsing fails, use the raw error text if available
      if (errorText) {
        errorMessage = errorText;
      }
    }

    throw new Error(errorMessage);
  }

  const data: ScrapeCreatorsVideoResponse = await response.json();

  // Validate response structure
  if (!data) {
    throw new Error("Invalid response from video API: empty response");
  }

  // Extract title
  const title = data.title?.trim() || "YouTube Video";

  // Extract transcript - prefer transcript_only_text if available, otherwise construct from transcript array
  let transcript = "";

  if (
    data.transcript_only_text &&
    data.transcript_only_text.trim().length > 0
  ) {
    transcript = data.transcript_only_text.trim();
  } else if (
    data.transcript &&
    Array.isArray(data.transcript) &&
    data.transcript.length > 0
  ) {
    transcript = data.transcript
      .map((item) => item.text)
      .filter((text) => text && text.trim().length > 0)
      .join(" ")
      .trim();
  }

  if (!transcript || transcript.length === 0) {
    throw new Error(
      "No transcript content found in the response. The video may not have captions enabled."
    );
  }

  return {
    transcript,
    title,
  };
}

export class YoutubeKbProcesser extends BaseKbProcesser {
  constructor(
    protected listener: KbProcesserListener,
    private readonly knowledgeGroup: KnowledgeGroup
  ) {
    super(listener);
  }

  async process() {
    const urls: string[] = [];
    const knowledgeGroupWithUrls = this.knowledgeGroup as KnowledgeGroup & {
      urls?: Array<{ url: string }>;
    };
    if (knowledgeGroupWithUrls.urls && knowledgeGroupWithUrls.urls.length > 0) {
      urls.push(
        ...knowledgeGroupWithUrls.urls.map((item: { url: string }) => item.url)
      );
    } else if (this.knowledgeGroup.url) {
      urls.push(this.knowledgeGroup.url);
    }

    if (urls.length === 0) {
      throw new Error("YouTube video URL is required");
    }

    for (const videoUrl of urls) {
      try {
        const { transcript, title } = await fetchYouTubeVideoData(videoUrl);

        if (!transcript || transcript.trim().length === 0) {
          await this.onError(
            videoUrl,
            new Error("No transcript available for this video")
          );
          continue;
        }

        await this.onContentAvailable(videoUrl, {
          text: transcript,
          title: title,
        });
      } catch (error) {
        await this.onError(
          videoUrl,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }
}
