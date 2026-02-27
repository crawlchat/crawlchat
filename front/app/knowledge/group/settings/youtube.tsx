import type { KnowledgeGroup } from "@packages/common/prisma";
import { useMemo } from "react";
import { useFetcher } from "react-router";
import { MultiSelect } from "~/components/multi-select";
import { SettingsSection } from "~/components/settings-section";
import { useDirtyForm } from "~/components/use-dirty-form";

export function YouTubeSettings({ group }: { group: KnowledgeGroup }) {
  const youtubeUrlsFetcher = useFetcher();
  const dirtyForm = useDirtyForm({
    youtubeUrls: group.urls?.map((item) => item.url).filter(Boolean) ?? [],
  });
  const youtubeUrlsString = useMemo(
    () => dirtyForm.getValue("youtubeUrls")?.join(",") ?? "",
    [dirtyForm.values]
  );

  return (
    <SettingsSection
      id="youtube-urls"
      fetcher={youtubeUrlsFetcher}
      title="YouTube Video URLs"
      description="Add multiple YouTube video URLs to extract transcripts from. Each URL will be processed and added to your knowledge base."
      dirty={dirtyForm.isDirty("youtubeUrls")}
    >
      <input value={youtubeUrlsString} name="youtubeUrls" type="hidden" />
      <MultiSelect
        value={dirtyForm.getValue("youtubeUrls") ?? []}
        onChange={(v) => dirtyForm.setValue("youtubeUrls", v)}
        placeholder="https://www.youtube.com/watch?v=..."
      />
    </SettingsSection>
  );
}
