import cn from "@meltdownjs/cn";
import { useMemo } from "react";
import { TbX } from "react-icons/tb";
import { useFetcher, useLoaderData } from "react-router";
import type { loader } from "./page";

function Tag({ title, count }: { title: string; count: number }) {
  const fetcher = useFetcher();

  return (
    <div
      className={cn(
        "border border-base-300 relative p-2 px-3 bg-base-100 flex gap-4",
        "group"
      )}
    >
      {title}
      <span className="badge badge-primary rounded-box badge-soft">
        {count}
      </span>

      <fetcher.Form
        method="post"
        className={cn(
          "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2",
          "z-10 hidden group-hover:flex",
          fetcher.state !== "idle" && "flex"
        )}
      >
        <input type="hidden" name="intent" value="remove-tag" />
        <input type="hidden" name="name" value={title} />
        <button className="btn btn-xs btn-soft btn-square btn-error">
          {fetcher.state !== "idle" ? (
            <span className="loading loading-spinner" />
          ) : (
            <TbX />
          )}
        </button>
      </fetcher.Form>
    </div>
  );
}

export default function Tags({ tagsOrder }: { tagsOrder: "top" | "latest" }) {
  const loaderData = useLoaderData<typeof loader>();

  const tags = useMemo(() => {
    if (!loaderData.summary) {
      return [];
    }

    const sortedTags = Object.entries(
      loaderData.summary.messagesSummary.tags
    ).sort((a, b) => {
      return b[1].count - a[1].count;
    });

    if (tagsOrder === "latest") {
      sortedTags.sort((a, b) => {
        return b[1].latestDate.getTime() - a[1].latestDate.getTime();
      });
    }

    return sortedTags
      .slice(0, 20)
      .map(([title, d]) => ({ title, count: d.count }));
  }, [loaderData.summary, tagsOrder]);

  return (
    <div className={cn("flex flex-row flex-wrap gap-2")}>
      {tags.map((tag) => (
        <Tag key={tag.title} title={tag.title} count={tag.count} />
      ))}
    </div>
  );
}
