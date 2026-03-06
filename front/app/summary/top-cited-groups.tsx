import cn from "@meltdownjs/cn";
import type { KnowledgeGroupType } from "@packages/common/prisma";
import { TbMessage } from "react-icons/tb";
import { Link } from "react-router";
import { KnowledgeGroupBadge } from "~/knowledge/group-badge";

export function TopCitedGroups({
  topGroupsCited,
}: {
  topGroupsCited: {
    id: string;
    name: string;
    type: KnowledgeGroupType;
    subType: string | null;
    percent: number;
    citedCount: number;
    totalCited: number;
  }[];
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto border border-base-300",
        "rounded-box bg-base-100"
      )}
    >
      <table className="table">
        <thead>
          <tr>
            <th className="w-46">Type</th>
            <th>Name</th>
            <th className="w-34">Percent</th>
          </tr>
        </thead>
        <tbody>
          {topGroupsCited.map((group) => (
            <tr key={group.id}>
              <td>
                <div className="flex items-center gap-2">
                  <KnowledgeGroupBadge
                    type={group.type}
                    subType={group.subType ?? undefined}
                  />
                  <div className="tooltip" data-tip="View questions">
                    <Link
                      to={`/questions?knowledgeGroupId=${group.id}`}
                      className="btn btn-xs btn-square"
                    >
                      <TbMessage />
                    </Link>
                  </div>
                </div>
              </td>
              <td>
                <span className="line-clamp-1" title={group.name}>
                  {group.name}
                </span>
              </td>
              <td>
                <div
                  className="tooltip"
                  data-tip={`${group.percent.toFixed(1)}% - ${group.citedCount} / ${group.totalCited}`}
                >
                  <progress
                    className="progress w-16 ml-2"
                    value={group.percent}
                    max="100"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
