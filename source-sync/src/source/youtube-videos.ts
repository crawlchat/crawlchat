import { fetchYouTubeVideoData } from "src/youtube";
import { GroupForSource, UpdateItemResponse, Source } from "./interface";
import { GroupData, ItemData } from "./queue";
import { scheduleUrl, scheduleUrls } from "./schedule";

export class YoutubeVideosSource implements Source {
  async updateGroup(jobData: GroupData, group: GroupForSource): Promise<void> {
    await scheduleUrls(
      group,
      jobData.processId,
      group.urls.map(({ url }) => ({ url, sourcePageId: url }))
    );
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
