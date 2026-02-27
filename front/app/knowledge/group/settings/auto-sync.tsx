import type {
  KnowledgeGroup,
  KnowledgeGroupUpdateFrequency,
} from "@packages/common/prisma";
import { useMemo } from "react";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/components/settings-section";
import { Timestamp } from "~/components/timestamp";
import { useDirtyForm } from "~/components/use-dirty-form";

export function AutoSyncSettings({
  group,
  intervals,
}: {
  group: KnowledgeGroup;
  intervals: KnowledgeGroupUpdateFrequency[];
}) {
  const fetcher = useFetcher();
  const dirtyForm = useDirtyForm({
    updateFrequency: group.updateFrequency ?? undefined,
  });
  const autoUpdateCollection = useMemo(() => {
    const allOptions = [{ label: "Never", value: "never" }];

    if (intervals.includes("hourly")) {
      allOptions.push({ label: "Every hour", value: "hourly" });
    }
    if (intervals.includes("daily")) {
      allOptions.push({ label: "Every day", value: "daily" });
    }
    if (intervals.includes("weekly")) {
      allOptions.push({ label: "Every week", value: "weekly" });
    }
    if (intervals.includes("monthly")) {
      allOptions.push({ label: "Every month", value: "monthly" });
    }

    return allOptions;
  }, [group.type]);

  return (
    <SettingsSection
      id="auto-update"
      fetcher={fetcher}
      title="Auto update"
      description="If enabled, the knowledge group will be updated automatically every day at the specified time."
      dirty={dirtyForm.isDirty("updateFrequency")}
    >
      <select
        className="select"
        name="updateFrequency"
        value={dirtyForm.getValue("updateFrequency") ?? ""}
        onChange={dirtyForm.handleChange("updateFrequency")}
      >
        {autoUpdateCollection.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {group.nextUpdateAt && (
        <div className="text-sm flex items-center">
          Next update at{" "}
          <span className="badge badge-neutral ml-2">
            <Timestamp date={group.nextUpdateAt} />
          </span>
        </div>
      )}
    </SettingsSection>
  );
}
