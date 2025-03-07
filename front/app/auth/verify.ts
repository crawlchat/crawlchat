import { authenticator } from ".";
import type { Route } from "./+types/verify";

export async function loader({ request }: Route.LoaderArgs) {
  await authenticator.authenticate("magic-link", request);
}
