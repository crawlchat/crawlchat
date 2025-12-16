import type { Route } from "./+types/list";
import { TbBook2 } from "react-icons/tb";
import { getAuthUser } from "~/auth/middleware";
import { Page } from "~/components/page";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { prisma } from "libs/prisma";
import { EmptyState } from "~/components/empty-state";
import { makeMeta } from "~/meta";
import cn from "@meltdownjs/cn";
import { Timestamp } from "~/components/timestamp";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const articles = await prisma.article.findMany({
    where: {
      scrapeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { articles };
}

export function meta() {
  return makeMeta({
    title: "Articles - CrawlChat",
  });
}

function NoArticles() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        title="No articles yet"
        description="Articles are guides and content published from conversations. Create a guide from a conversation to get started."
        icon={<TbBook2 />}
      />
    </div>
  );
}

export default function Articles({ loaderData }: Route.ComponentProps) {
  return (
    <Page
      title="Articles"
      icon={<TbBook2 />}
    >
      {loaderData.articles.length === 0 && <NoArticles />}
      {loaderData.articles.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="text-base-content/50">
            Articles are guides and content published from conversations.
          </div>

          <div
            className={cn(
              "overflow-x-auto border border-base-300",
              "rounded-box bg-base-200/50 shadow"
            )}
          >
            <table className="table">
              <colgroup>
                <col />
                <col className="w-[20%]" />
                <col className="min-w-24 w-[16%]" />
              </colgroup>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Purpose</th>
                  <th className="text-end">Created</th>
                </tr>
              </thead>
              <tbody>
                {loaderData.articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link
                        className="link link-hover font-medium"
                        to={`/article/${article.id}`}
                        prefetch="intent"
                      >
                        {article.title || (
                          <span className="text-base-content/50">
                            Untitled Article
                          </span>
                        )}
                      </Link>
                    </td>
                    <td>
                      <div className="badge badge-soft">
                        {article.purpose}
                      </div>
                    </td>
                    <td className="text-end">
                      <Timestamp date={article.createdAt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Page>
  );
}
