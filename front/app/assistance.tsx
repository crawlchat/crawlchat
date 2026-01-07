import type { Route } from "./+types/assistance";
import type { ScrapeUser, User } from "libs/prisma";
import { TbHelp, TbUserPlus, TbX } from "react-icons/tb";
import { Page } from "./components/page";
import { getAuthUser } from "./auth/middleware";
import { prisma } from "libs/prisma";
import { authoriseScrapeUser, getSessionScrapeId } from "~/scrapes/util";
import { useFetcher } from "react-router";
import { useFetcherToast } from "~/components/use-fetcher-toast";
import cn from "@meltdownjs/cn";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  const scrapeId = await getSessionScrapeId(request);
  authoriseScrapeUser(user!.scrapeUsers, scrapeId);

  const scrapeUsers = await prisma.scrapeUser.findMany({
    where: {
      scrapeId,
    },
  });

  const assistants = await prisma.user.findMany({
    where: {
      email: {
        in: ["pramodkumar.damam73@gmail.com", "pramod@crawlchat.app"],
      },
    },
  });
  return { assistants, scrapeUsers };
}

function UserCard({
  user,
  scrapeUsers,
}: {
  user: User;
  scrapeUsers: ScrapeUser[];
}) {
  const scrapeUser = scrapeUsers.find(
    (scrapeUser) => scrapeUser.email === user.email
  );
  const joinFetcher = useFetcher();
  const leaveFetcher = useFetcher();

  useFetcherToast(joinFetcher, { title: "Added to your team" });
  useFetcherToast(leaveFetcher, { title: "Removed from your team" });

  return (
    <div
      key={user.id}
      className={cn(
        "bg-base-200/50 rounded-box p-4 border border-base-300",
        "flex justify-between items-center"
      )}
    >
      <div className="flex items-center gap-4">
        {user.photo && (
          <img
            src={user.photo}
            alt={user.name || user.email}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <div className="text-lg font-bold">{user.name}</div>
          <p className="text-sm text-base-content/50">{user.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {!scrapeUser ? (
          <joinFetcher.Form method="post" action="/team">
            <input type="hidden" name="intent" value="invite" />
            <input type="hidden" name="email" value={user.email} />
            <button
              className="btn btn-primary"
              type="submit"
              disabled={joinFetcher.state !== "idle"}
            >
              {joinFetcher.state !== "idle" && (
                <span className="loading loading-spinner" />
              )}
              <TbUserPlus />
              Add to my team
            </button>
          </joinFetcher.Form>
        ) : (
          <leaveFetcher.Form method="post" action="/team">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="scrapeUserId" value={scrapeUser.id} />
            <button
              className="btn btn-error"
              type="submit"
              disabled={leaveFetcher.state !== "idle"}
            >
              {leaveFetcher.state !== "idle" && (
                <span className="loading loading-spinner" />
              )}
              <TbX />
              Remove
            </button>
          </leaveFetcher.Form>
        )}
      </div>
    </div>
  );
}

export default function Assistance({ loaderData }: Route.ComponentProps) {
  return (
    <Page title="Assistance" icon={<TbHelp />}>
      <div className="flex flex-col gap-4">
        <p className="text-base-content/50">
          Need help in setting up your collection and connecting the chatbot
          with your website, Discord server, Slack workspace or MCP? Add
          following people to your team so that they can help you in it!
        </p>
        <div className="flex flex-col gap-4">
          {loaderData.assistants.map((assistant) => (
            <UserCard
              key={assistant.id}
              user={assistant}
              scrapeUsers={loaderData.scrapeUsers}
            />
          ))}
        </div>
      </div>
    </Page>
  );
}
