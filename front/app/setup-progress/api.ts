import { getAuthUser } from "~/auth/middleware";
import { getSession } from "~/session";
import { getSetupProgressInput } from "./make";
import { authoriseScrapeUser } from "~/scrapes/util";
import type { Route } from "./+types/api";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request, { redirectTo: "/login" });

  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");
  authoriseScrapeUser(user!.scrapeUsers!, scrapeId!);

  return {
    input: await getSetupProgressInput(user!.id, scrapeId!),
  };
}
