import type { KnowledgeGroup } from "@packages/common/prisma";
import { TbMessage } from "react-icons/tb";
import { Link } from "react-router";
import { numberToKMB } from "~/components/number-util";
import { KnowledgeGroupBadge } from "~/knowledge/group-badge";

export function TopPages({
  topItems,
}: {
  topItems: {
    id: string;
    title: string | null;
    url: string | null;
    knowledgeGroup: KnowledgeGroup | null;
    count: number;
  }[];
}) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>Page</th>
            <th>Count</th>
            <th className="text-right">Knowledge Group</th>
          </tr>
        </thead>
        <tbody>
          {topItems.map((item) => (
            <tr key={item.url}>
              <td>
                <div>
                  <Link
                    className="link link-hover line-clamp-1 link-primary w-fit"
                    to={`/knowledge/item/${item.id}`}
                  >
                    {item.title}
                  </Link>
                </div>
                <div className="text-xs text-base-content/50">{item.url}</div>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="tooltip" data-tip="View questions">
                    <Link
                      to={`/questions?pageId=${item.id}`}
                      className="btn btn-xs btn-square"
                    >
                      <TbMessage />
                    </Link>
                  </div>
                  <span className="badge badge-soft">
                    {numberToKMB(item.count)}
                  </span>
                </div>
              </td>
              <td className="text-right">
                {item.knowledgeGroup && (
                  <KnowledgeGroupBadge
                    type={item.knowledgeGroup.type}
                    subType={item.knowledgeGroup.subType ?? undefined}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
