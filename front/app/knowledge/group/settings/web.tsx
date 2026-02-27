import type { KnowledgeGroup } from "@packages/common/prisma";
import { useFetcher } from "react-router";
import { SettingsSection } from "~/components/settings-section";
import { useDirtyForm } from "~/components/use-dirty-form";

export function WebSettings({ group }: { group: KnowledgeGroup }) {
  const matchPrefixFetcher = useFetcher();
  const htmlTagsToRemoveFetcher = useFetcher();
  const include404Pages = useFetcher();
  const scrollSelectorFetcher = useFetcher();
  const loadDynamicallyFetcher = useFetcher();
  const itemContextFetcher = useFetcher();

  const form = useDirtyForm({
    matchPrefix: group.matchPrefix ?? false,
    include404: group.include404 ?? false,
    removeHtmlTags: group.removeHtmlTags ?? "",
    itemContext: group.itemContext ?? "",
    scrollSelector: group.scrollSelector ?? "",
    loadDynamically: group.loadDynamically ?? false,
  });

  return (
    <>
      <SettingsSection
        id="match-prefix"
        fetcher={matchPrefixFetcher}
        title="Match prefix"
        description="If enabled, it scrapes only the pages whose prefix is the same as the group URL"
        dirty={form.isDirty("matchPrefix")}
      >
        <input type="hidden" name="from-match-prefix" value={"true"} />
        <label className="label">
          <input
            type="checkbox"
            name="matchPrefix"
            checked={(form.getValue("matchPrefix") as boolean) ?? false}
            onChange={form.handleChange("matchPrefix")}
            className="toggle"
          />
          Active
        </label>
      </SettingsSection>

      <SettingsSection
        id="include-404-pages"
        fetcher={include404Pages}
        title="Include 404 pages"
        description="If disabled, it will not upsert the pages which respond with 404 not found."
        dirty={form.isDirty("include404")}
      >
        <input type="hidden" name="from-include-404" value={"true"} />
        <label className="label">
          <input
            type="checkbox"
            name="include404"
            checked={(form.getValue("include404") as boolean) ?? false}
            onChange={form.handleChange("include404")}
            className="toggle"
          />
          Active
        </label>
      </SettingsSection>

      <SettingsSection
        id="html-tags-to-remove"
        fetcher={htmlTagsToRemoveFetcher}
        title="HTML tags to remove"
        description="You can specify the HTML selectors whose content is not added to the document. It is recommended to use this to remove junk content such as side menus, headers, footers, etc. You can give multiple selectors comma separated."
        dirty={form.isDirty("removeHtmlTags")}
      >
        <input
          placeholder="Ex: #sidebar, #header, #footer"
          value={(form.getValue("removeHtmlTags") as string) ?? ""}
          onChange={form.handleChange("removeHtmlTags")}
          name="removeHtmlTags"
          className="input"
        />
      </SettingsSection>

      <SettingsSection
        id="item-context"
        fetcher={itemContextFetcher}
        title="Item context"
        description="Pass context for the group knowledge. Usefule to segregate the data between types. Example: v1, v2, node, bun, etc."
        dirty={form.isDirty("itemContext")}
      >
        <input
          name="itemContext"
          value={(form.getValue("itemContext") as string) ?? ""}
          onChange={form.handleChange("itemContext")}
          placeholder="Ex: v1, v2, node, bun, etc."
          className="input"
        />
        <div className="text-sm text-base-content/50">
          This requires re-fetching the knowledge group.
        </div>
      </SettingsSection>

      <SettingsSection
        id="scroll-selector"
        fetcher={scrollSelectorFetcher}
        title="Scroll selector"
        description="Specify the selector of the element to scroll to. It is useful to scrape pages that have infinite scroll."
        dirty={form.isDirty("scrollSelector")}
      >
        <input
          placeholder="Ex: #panel"
          className="input"
          value={(form.getValue("scrollSelector") as string) ?? ""}
          onChange={form.handleChange("scrollSelector")}
          name="scrollSelector"
        />
      </SettingsSection>

      <SettingsSection
        id="load-dynamically"
        fetcher={loadDynamicallyFetcher}
        title="Load dynamically"
        description="If enabled, it will load the page dynamically. It is useful to scrape pages that have infinite scroll."
        dirty={form.isDirty("loadDynamically")}
      >
        <input type="hidden" name="from-load-dynamically" value={"true"} />
        <label className="label">
          <input
            type="checkbox"
            name="loadDynamically"
            checked={(form.getValue("loadDynamically") as boolean) ?? false}
            onChange={form.handleChange("loadDynamically")}
            className="toggle"
          />
          Active
        </label>
      </SettingsSection>
    </>
  );
}
