import cn from "@meltdownjs/cn";
import { TbX } from "react-icons/tb";
import { useFetcher } from "react-router";

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
        <input type="hidden" name="tagName" value={title} />
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

export default function Tags({
  tags,
}: {
  tags: Array<{ title: string; count: number }>;
}) {
  return (
    <div className={cn("flex flex-row flex-wrap gap-2")}>
      {tags.map((tag) => (
        <Tag key={tag.title} title={tag.title} count={tag.count} />
      ))}
    </div>
  );
}
