import cn from "@meltdownjs/cn";
import { numberToKMB } from "~/components/number-util";

export default function CategoryCardStat({
  label,
  value,
  error,
  tooltip,
}: {
  label: string;
  value: number | string;
  error?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex flex-col items-end gap-1 tooltip" data-tip={tooltip}>
      <span className="text-base-content/50 text-xs text-right shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "badge badge-sm badge-soft",
          error ? "badge-error" : "badge-primary"
        )}
      >
        {typeof value === "number" ? numberToKMB(value) : value}
      </span>
    </div>
  );
}
