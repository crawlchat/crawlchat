import cn from "@meltdownjs/cn";
import { FaXmark } from "react-icons/fa6";
import type { FetcherWithComponents } from "react-router";

export default function Tags({
  tags,
  fetcher,
}: {
  fetcher: FetcherWithComponents<any>;
  tags: Array<{ title: string; count: number }>;
}) {
  return (
    <div className={cn("flex flex-row flex-wrap gap-3")}>
      {tags.map((tag) => (
        <div
          className={cn(
            "border border-base-300 relative p-4 pr-7 bg-base-100 flex gap-4"
          )}
        >
          {tag.title}
          <span className="badge badge-primary rounded-4xl badge-soft">
            {tag.count}
          </span>
          <FaXmark
            onClick={() => {
              fetcher.submit(
                { tagName: tag.title, intent: "remove-tag" },
                { method: "post" }
              );
            }}
            size={12}
            className={cn(
              " text-primary absolute justify-self-end self-start opacity-50 top-1 right-1 cursor-pointer"
            )}
          />
        </div>
      ))}
    </div>
  );
}
