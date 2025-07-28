import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/setup-progress-api";
import { getSession } from "~/session";
import { getSetupProgressInput } from "./setup-progress-make";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request, { redirectTo: "/login" });

  const session = await getSession(request.headers.get("cookie"));
  const scrapeId = session.get("scrapeId");

  return {
    input: await getSetupProgressInput(user!.id, scrapeId!)
  };
}
