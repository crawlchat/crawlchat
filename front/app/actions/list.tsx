import type { Route } from "./+types/list";
import type { ApiActionType } from "libs/prisma";
import { TbPlus, TbPointer, TbWebhook } from "react-icons/tb";
import { Link } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { Page } from "~/components/page";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { prisma } from "libs/prisma";
import { EmptyState } from "~/components/empty-state";
import { makeMeta } from "~/meta";
import moment from "moment";
import cn from "@meltdownjs/cn";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const actions = await prisma.apiAction.findMany({
    where: {
      scrapeId,
    },
  });

  const counts: Record<string, number> = {};
  for (const action of actions) {
    const count = await prisma.message.count({
      where: {
        scrapeId,
        apiActionCalls: {
          some: {
            actionId: action.id,
          },
        },
      },
    });
    counts[action.id] = count;
  }

  return { actions, counts };
}

export function meta() {
  return makeMeta({
    title: "Actions - CrawlChat",
  });
}

function NoActions() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        title="No actions yet"
        description="Actions let you connect to external systems with HTTP APIs. These actions will get called by AI and chatbot whenever required. These APIs are called from backend in a secured way."
        icon={<TbPointer />}
        children={
          <Link className={"btn btn-primary"} to="/actions/new">
            <TbPlus />
            New
          </Link>
        }
      />
    </div>
  );
}

function ActionType({ type }: { type: ApiActionType | null }) {
  if (type === "cal")
    return (
      <div className="min-w-22">
        <img src="/cal.png" alt="Cal" className="w-6 h-6 rounded-box" />
      </div>
    );

  return (
    <div className="min-w-22">
      <TbWebhook />
    </div>
  );
}

export default function Actions({ loaderData }: Route.ComponentProps) {
  return (
    <Page
      title="Actions"
      icon={<TbPointer />}
      right={
        <Link className={"btn btn-primary btn-soft"} to="/actions/new">
          <TbPlus />
          New
        </Link>
      }
    >
      {loaderData.actions.length === 0 && <NoActions />}
      {loaderData.actions.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="text-base-content/50">
            Actions let you connect to external systems with HTTP APIs. These
            actions will get called by AI and chatbot whenever required. These
            APIs are called from backend in a secured way.
          </div>

          <div
            className={cn(
              "overflow-x-auto border border-base-300",
              "rounded-box bg-base-200/50 shadow"
            )}
          >
            <table className="table">
              <colgroup>
                <col className="w-[5%]" />
                <col />
                <col className="w-[16%]" />
                <col className="min-w-24 w-[14%]" />
              </colgroup>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Calls</th>
                  <th className="text-end">Created</th>
                </tr>
              </thead>
              <tbody>
                {loaderData.actions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <ActionType type={item.type} />
                    </td>
                    <td className="truncate">
                      <Link
                        className="link link-hover"
                        to={`/actions/${item.id}`}
                        prefetch="intent"
                      >
                        {item.title}
                      </Link>
                    </td>

                    <td>
                      <div className="badge badge-soft badge-primary gap-2">
                        <TbPointer />
                        {loaderData.counts[item.id]}
                      </div>
                    </td>
                    <td className="text-end">
                      {moment(item.createdAt).fromNow()}
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
