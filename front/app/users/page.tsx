import type { Route } from "./+types/page";
import { TbUsers } from "react-icons/tb";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "@packages/common/prisma";
import { Page } from "~/components/page";
import { makeMeta } from "~/meta";
import { UniqueUsers } from "~/summary/unique-users";
import { calcUniqueUsers } from "~/summary/calc-unique-users";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";
import { useSearchParams } from "react-router";

const DATE_RANGE_OPTIONS = [
  { value: 7, label: "Last week" },
  { value: 14, label: "Last 2 weeks" },
  { value: 30, label: "Last 1 month" },
  { value: 90, label: "Last 3 months" },
  { value: 180, label: "Last 6 months" },
];

const VALID_DAYS = DATE_RANGE_OPTIONS.map((o) => o.value);

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const url = new URL(request.url);
  const daysParam = parseInt(url.searchParams.get("days") ?? "30", 10);
  const days = VALID_DAYS.includes(daysParam) ? daysParam : 30;
  const DAY_MS = 1000 * 60 * 60 * 24;

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
      createdAt: {
        gte: new Date(Date.now() - days * DAY_MS),
      },
      llmMessage: {
        is: {
          role: "user",
        },
      },
    },
    select: {
      createdAt: true,
      llmMessage: {
        select: {
          role: true,
        },
      },
      fingerprint: true,
      channel: true,
      thread: {
        select: {
          location: true,
        },
      },
    },
  });

  const uniqueUsers = calcUniqueUsers(messages);

  return { uniqueUsers, days };
}

export function meta() {
  return makeMeta({
    title: "Users - CrawlChat",
  });
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const [, setSearchParams] = useSearchParams();

  return (
    <Page
      title="Users"
      icon={<TbUsers />}
      right={
        <select
          className="select"
          value={loaderData.days}
          onChange={(e) => {
            setSearchParams({ days: e.target.value });
          }}
        >
          {DATE_RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      }
    >
      <UniqueUsers users={loaderData.uniqueUsers} />
    </Page>
  );
}
