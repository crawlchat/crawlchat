import type { Route } from "./+types/page";
import { TbUsers } from "react-icons/tb";
import { getAuthUser } from "~/auth/middleware";
import { prisma } from "@packages/common/prisma";
import { Page } from "~/components/page";
import { makeMeta } from "~/meta";
import { UniqueUsers } from "~/summary/unique-users";
import { calcUniqueUsers } from "~/summary/calc-unique-users";
import { authoriseScrapeUser, getSessionScrapeId } from "~/auth/scrape-session";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const messages = await prisma.message.findMany({
    where: {
      scrapeId,
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

  return { uniqueUsers };
}

export function meta() {
  return makeMeta({
    title: "Users - CrawlChat",
  });
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Users" icon={<TbUsers />}>
      <UniqueUsers users={loaderData.uniqueUsers} />
    </Page>
  );
}
