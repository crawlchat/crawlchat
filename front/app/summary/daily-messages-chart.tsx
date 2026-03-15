import cn from "@meltdownjs/cn";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import { BRIGHT_COLORS } from "./bright-colors";
import type { loader } from "./page";

export function DailyMessagesChart({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const loaderData = useLoaderData<typeof loader>();
  const [width, setWidth] = useState(0);

  const [chartData, categories] = useMemo(() => {
    const data: Record<string, number | string>[] = [];
    const today = new Date();
    const DAY_MS = 1000 * 60 * 60 * 24;
    const groupByMonth = loaderData.days > 60;

    if (!loaderData.summary) {
      return [data, new Set<string>()];
    }

    if (groupByMonth) {
      const monthlyData: Record<string, Record<string, number | string>> = {};

      const startDate = new Date(today.getTime() - loaderData.days * DAY_MS);
      const startMonth = moment(startDate).startOf("month");
      const endMonth = moment(today).startOf("month");

      for (
        let m = startMonth.clone();
        m.isSameOrBefore(endMonth);
        m.add(1, "month")
      ) {
        const monthKey = m.format("YYYY-MM");
        monthlyData[monthKey] = {
          name: m.format("MMM YYYY"),
          Questions: 0,
          Unhappy: 0,
          Other: 0,
        };
        for (const category of loaderData.scrape?.messageCategories ?? []) {
          monthlyData[monthKey][category.title] = 0;
        }
      }

      for (const [dayKey, item] of Object.entries(
        loaderData.summary.messagesSummary.dailyMessages
      )) {
        const monthKey = dayKey.substring(0, 7);
        if (!monthlyData[monthKey]) continue;
        monthlyData[monthKey].Questions =
          (monthlyData[monthKey].Questions as number) + item.count;
        monthlyData[monthKey].Unhappy =
          (monthlyData[monthKey].Unhappy as number) + item.unhappy;
        monthlyData[monthKey].Other =
          (monthlyData[monthKey].Other as number) +
          (item.categories["Other"] ?? 0);
        for (const category of loaderData.scrape?.messageCategories ?? []) {
          monthlyData[monthKey][category.title] =
            (monthlyData[monthKey][category.title] as number) +
            (item.categories[category.title] ?? 0);
        }
      }

      const sortedKeys = Object.keys(monthlyData).sort();
      for (const key of sortedKeys) {
        data.push(monthlyData[key]);
      }
    } else {
      for (let i = 0; i < loaderData.days; i++) {
        const date = new Date(today.getTime() - i * DAY_MS);
        const key = date.toISOString().split("T")[0];
        const name = moment(date).format("MMM D");

        const item = loaderData.summary.messagesSummary.dailyMessages[key];

        const record: Record<string, number | string> = {
          name,
          Questions: item?.count ?? 0,
          Unhappy: item?.unhappy ?? 0,
          Other: item?.categories["Other"] ?? 0,
        };

        for (const category of loaderData.scrape?.messageCategories ?? []) {
          record[category.title] = item?.categories[category.title] ?? 0;
        }

        data.push(record);
      }

      data.reverse();
    }

    const categories = new Set<string>(["Other"]);
    for (const category of loaderData.scrape?.messageCategories ?? []) {
      categories.add(category.title);
    }

    return [data, categories];
  }, [loaderData.summary, loaderData.days]);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.clientWidth - 10);
    }
  }, [containerRef, loaderData]);

  function renderTooltip(props: {
    label?: string;
    payload?: Payload<number, string>[] | undefined;
  }) {
    return (
      <div className="bg-base-200 border border-base-300 rounded-box">
        <div className="p-2 px-3 border-b border-base-300 text-xs font-medium opacity-80">
          {props.label}
        </div>
        <ul className="flex flex-col gap-1 p-2">
          {props.payload?.map((item) => {
            if (item.value === 0) {
              return null;
            }

            const index = Array.from(categories).indexOf(item.name ?? "");
            const color = BRIGHT_COLORS[index % BRIGHT_COLORS.length];
            return (
              <li
                key={item.name}
                className="flex items-center gap-6 justify-between"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: color ?? "red",
                    }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span
                  className={cn(
                    "min-w-5 h-5 px-1 text-sm flex items-center justify-center rounded-full",
                    item.name === "Unhappy"
                      ? "bg-error text-error-content"
                      : "bg-primary text-primary-content"
                  )}
                >
                  {item.value}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  function renderTick(props: {
    x: number;
    y: number;
    payload: { value: string };
  }) {
    return (
      <text
        x={props.x}
        y={props.y + 4}
        dy={16}
        textAnchor="middle"
        fill="var(--color-primary)"
        fontSize={12}
      >
        {props.payload.value}
      </text>
    );
  }

  return (
    <div
      className={cn(
        "rounded-box overflow-hidden",
        "p-4 bg-base-100 border border-base-300"
      )}
    >
      <ComposedChart width={width - 24} height={260} data={chartData}>
        <XAxis dataKey="name" interval={"preserveStartEnd"} tick={renderTick} />
        <Tooltip content={renderTooltip} />
        <CartesianGrid strokeDasharray="6 6" vertical={false} />
        {Array.from(categories).map((category, i) => (
          <Bar
            key={category}
            type="monotone"
            dataKey={category}
            fill={BRIGHT_COLORS[i % BRIGHT_COLORS.length]}
            barSize={30}
            stackId="a"
          />
        ))}
        <Line
          type="monotone"
          dataKey="Unhappy"
          stroke={"var(--color-error)"}
          dot={false}
        />
      </ComposedChart>
    </div>
  );
}
