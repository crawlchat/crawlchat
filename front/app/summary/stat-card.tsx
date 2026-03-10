import cn from "@meltdownjs/cn";
import { numberToKMB } from "~/components/number-util";

export default function StatCard({
  label,
  value,
  icon,
  suffix,
  tooltip,
  toFixed,
}: {
  label: string;
  value?: number;
  icon: React.ReactNode;
  suffix?: string;
  tooltip?: string;
  toFixed?: number;
}) {
  return (
    <div className="tooltip tooltip-bottom" data-tip={tooltip}>
      <div
        className={cn(
          "stats flex-1 bg-base-100 w-full",
          "border border-base-300 rounded-box"
        )}
      >
        <div className="stat">
          <div className="stat-figure text-3xl opacity-50">{icon}</div>
          <div className="stat-title">{label}</div>
          <div className="stat-value">
            {value !== undefined ? numberToKMB(value, toFixed) : ""}
            {suffix}
          </div>
        </div>
      </div>
    </div>
  );
}
