import cn from "@meltdownjs/cn";
import type { QuestionSentiment } from "@packages/common/prisma";
import { TbMoodCry, TbMoodHappy } from "react-icons/tb";

export function SentimentBadge({
  sentiment,
}: {
  sentiment?: QuestionSentiment | null;
}) {
  if (!sentiment || sentiment === "neutral") return null;

  return (
    <div
      className={cn(
        "badge badge-soft",
        sentiment === "sad" ? "badge-error" : "badge-success"
      )}
    >
      {sentiment === "sad" && <TbMoodCry />}
      {sentiment === "happy" && <TbMoodHappy />}
    </div>
  );
}
