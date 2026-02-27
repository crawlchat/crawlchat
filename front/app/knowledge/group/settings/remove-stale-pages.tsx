import type { KnowledgeGroup } from "@packages/common/prisma";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/components/settings-section";
import { useDirtyForm } from "~/components/use-dirty-form";

export function RemoveStalePagesSettings({ group }: { group: KnowledgeGroup }) {
  const fetcher = useFetcher();
  const dirtyForm = useDirtyForm({
    removeStalePages: group.removeStalePages ?? false,
  });

  return (
    <SettingsSection
      id="remove-stale-pages"
      fetcher={fetcher}
      title="Remove stale pages"
      description="If enabled, pages that are no longer found in the source will be automatically removed after each sync."
      dirty={dirtyForm.isDirty("removeStalePages")}
    >
      <input type="hidden" name="from-remove-stale-pages" value={"true"} />
      <label className="label">
        <input
          type="checkbox"
          name="removeStalePages"
          checked={dirtyForm.getValue("removeStalePages") ?? false}
          onChange={dirtyForm.handleChange("removeStalePages")}
          className="toggle"
        />
        Active
      </label>
    </SettingsSection>
  );
}
