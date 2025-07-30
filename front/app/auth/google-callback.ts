import { redirect } from "react-router";
import { authenticator } from "~/auth";
import type { Route } from "./+types/google-callback";
import { commitSession, getSession } from "~/session";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await authenticator.authenticate("google", request);

  if (!user) {
    return { error: "Invalid credentials" };
  }

  const session = await getSession(request.headers.get("cookie"));
  session.set("user", user)
  return redirect("/app", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
