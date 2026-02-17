import type { Location, MessageChannel } from "@packages/common/prisma";
import Avatar from "boring-avatars";
import { CountryFlag } from "~/message/country-flag";
import { ChannelBadge } from "~/components/channel-badge";
import { Timestamp } from "~/components/timestamp";
import { Link } from "react-router";

export type UniqueUser = {
  fingerprint: string;
  questionsCount: number;
  firstAsked: Date;
  lastAsked: Date;
  ageDays: number;
  channel: MessageChannel | null;
  location: Location | null;
};

export function UniqueUsers({ users }: { users: UniqueUser[] }) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Questions</th>
            <th>Age</th>
            <th>First asked</th>
            <th>Last asked</th>
            <th>Channel</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.fingerprint}>
              <td>
                <Link
                  to={`/questions?fingerprint=${user.fingerprint}`}
                  className="flex items-center gap-2 link-hover text-primary"
                >
                  <Avatar
                    name={user.fingerprint}
                    size={24}
                    variant="beam"
                    className="shrink-0"
                  />
                  {user.location?.country && (
                    <CountryFlag location={user.location} />
                  )}
                  <span className="whitespace-nowrap">
                    #{user.fingerprint.slice(0, 6)}
                  </span>
                </Link>
              </td>
              <td>
                <span className="badge badge-soft">{user.questionsCount}</span>
              </td>
              <td>
                <span className="badge badge-soft">{user.ageDays}d</span>
              </td>
              <td className="whitespace-nowrap">
                <Timestamp date={user.firstAsked} />
              </td>
              <td className="whitespace-nowrap">
                <Timestamp date={user.lastAsked} />
              </td>
              <td>
                <ChannelBadge channel={user.channel} onlyIcon />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
