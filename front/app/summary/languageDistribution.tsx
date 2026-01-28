import cn from "@meltdownjs/cn";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import { Heading } from "~/summary";

export default function LanguageDistribution({
  languages,
}: {
  languages: Record<string, number>;
}) {
  return (
    <div style={{ width: "100%" }}>
      <Heading className="mb-0">Languages</Heading>
      <ResponsiveContainer width="100%" aspect={2} minHeight={120}>
        <PieChart
          className={cn(
            "w-full max-w-3xl bg-base-100 border border-base-300 rounded-box p-4 my-2"
          )}
        >
          <Pie
            startAngle={360}
            endAngle={0}
            label={PieLabel}
            isAnimationActive
            fill="var(--color-primary)"
            dataKey="count"
            nameKey="name"
            data={Object.entries(languages).map(([key, val]) => ({
              name: key,
              count: val,
            }))}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: any) {
  const RADIAN = Math.PI / 180;
  const adjust = 0.5; // smaller -> closer to center
  const r =
    (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * adjust;
  const x = (cx ?? 0) + r * Math.cos(-midAngle * RADIAN);
  const y = (cy ?? 0) + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      fontSize={16}
      fontWeight="bolder"
      textAnchor={x > (cx ?? 0) ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
