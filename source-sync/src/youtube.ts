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
    if (
      channelUrl.startsWith("UC-") ||
      channelUrl.match(/^UC[a-zA-Z0-9_-]{22}$/)
    ) {
      return { channelId: channelUrl };
    }

    // If it's a handle (starts with @)
    if (channelUrl.startsWith("@")) {
      return { handle: channelUrl.substring(1) };
    }

    return { handle: channelUrl };
  } catch {
    // If URL parsing fails, assume it's a channel ID or handle
    if (
      channelUrl.startsWith("UC-") ||
      channelUrl.match(/^UC[a-zA-Z0-9_-]{22}$/)
    ) {
      return { channelId: channelUrl };
    }
    if (channelUrl.startsWith("@")) {
      return { handle: channelUrl.substring(1) };
    }
    return { handle: channelUrl };
  }
}

export async function fetchChannelVideos(channelUrl: string, cursor?: string) {
  const apiKey = process.env.SCRAPECREATORS_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPECREATORS_API_KEY environment variable is not set.");
  }

  const { channelId, handle } = extractChannelIdOrHandle(channelUrl);

  const apiUrl = new URL(
    "https://api.scrapecreators.com/v1/youtube/channel-videos"
  );

  if (channelId) {
    apiUrl.searchParams.append("channelId", channelId);
  } else if (handle) {
    apiUrl.searchParams.append("handle", handle);
  } else {
    throw new Error(
      "Invalid channel URL. Must be a channel ID, handle, or YouTube channel URL."
    );
  }

  if (cursor) {
    apiUrl.searchParams.set("continuationToken", cursor);
  }

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

  return (await response.json()) as ChannelVideosResponse;
}

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

type YouTubeVideoData = {
  transcript: string;
  title: string;
};

export async function fetchYouTubeVideoData(
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
