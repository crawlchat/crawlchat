import { fetchYouTubeVideoData } from "src/youtube";
import { GroupForSource, UpdateItemResponse, Source } from "./interface";
import { GroupData, ItemData } from "./queue";
import { scheduleUrl } from "./schedule";

export class YoutubeVideosSource implements Source {
  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    for (const videoUrl of group.urls) {
      await scheduleUrl(group, jobData.processId, videoUrl.url, videoUrl.url);
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
    return {
      page: {
        text: transcript,
        title: title,
      },
    };
  }
}
