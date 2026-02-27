import type { KnowledgeGroup } from "@packages/common/prisma";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/components/settings-section";
import { useDirtyForm } from "~/components/use-dirty-form";

export function GithubDiscussionsSettings({
  group,
}: {
  group: KnowledgeGroup;
}) {
  const onlyAnsweredFetcher = useFetcher();
  const dirtyForm = useDirtyForm({
    onlyAnsweredDiscussions: (group as any).onlyAnsweredDiscussions ?? false,
  });

  return (
    <SettingsSection
      id="only-answered-discussions"
      fetcher={onlyAnsweredFetcher}
      title="Only answered"
      description="If enabled, only fetch discussions that have been marked as answered. By default, all discussions are fetched."
      dirty={dirtyForm.isDirty("onlyAnsweredDiscussions")}
    >
      <input
        type="hidden"
        name="onlyAnsweredDiscussions"
        value={dirtyForm.getValue("onlyAnsweredDiscussions") ? "on" : ""}
      />
      <label className="label cursor-pointer justify-start gap-4">
        <input
          type="checkbox"
          checked={dirtyForm.getValue("onlyAnsweredDiscussions") ?? false}
          onChange={dirtyForm.handleChange("onlyAnsweredDiscussions")}
          className="toggle"
        />
        <span className="label-text">Only fetch answered discussions</span>
      </label>
    </SettingsSection>
  );
}
