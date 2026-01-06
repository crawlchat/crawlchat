import { GroupForSource, UpdateItemResponse, Source } from "./interface";
import { GroupData, ItemData } from "./queue";
import { scheduleGroup, scheduleUrl } from "./schedule";
import { fetchChannelVideos, fetchYouTubeVideoData } from "../youtube";

export class YoutubeChannelSource implements Source {
  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    if (!group.url) {
      throw new Error("Group url is required");
    }

    const { videos, nextPageToken } = await fetchChannelVideos(
      group.url,
      jobData.cursor
    );

    const skipRegexes = (group.skipPageRegex?.split(",") ?? []).filter(Boolean);

    const filteredVideos = videos.filter((video) => {
      if (skipRegexes.length === 0) {
        return true;
      }
      return !skipRegexes.some((regex) => {
        const r = new RegExp(regex.trim());
        return r.test(video.url) || r.test(video.id) || r.test(video.title);
      });
    });

    for (let i = 0; i < filteredVideos.length; i++) {
      const video = filteredVideos[i];
      await scheduleUrl(group, jobData.processId, video.url, {
        cursor: i === filteredVideos.length - 1 ? nextPageToken : undefined,
      });
    }
  }

  async updateItem(
    jobData: ItemData,
    group: GroupForSource
  ): Promise<UpdateItemResponse> {
    const { transcript, title } = await fetchYouTubeVideoData(jobData.url);

    if (!transcript || transcript.trim().length === 0) {
      throw new Error("No transcript available for this video");
    }

    if (jobData.cursor) {
      await scheduleGroup(group, jobData.processId, {
        cursor: jobData.cursor,
      });
    }

    return {
      page: {
        text: transcript,
        title: title,
      },
    };
  }
}
