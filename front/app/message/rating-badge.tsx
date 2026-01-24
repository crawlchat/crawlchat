import cn from "@meltdownjs/cn";
import type { Message } from "@packages/common/prisma";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";

export function Rating({ rating }: { rating: Message["rating"] }) {
  if (!rating) return null;

  return (
    <div
      className={cn(
        "badge badge-soft px-2",
        rating === "up" ? "badge-success" : "badge-error"
      )}
    >
      {rating === "up" ? <TbThumbUp /> : <TbThumbDown />}
    </div>
  );
}
