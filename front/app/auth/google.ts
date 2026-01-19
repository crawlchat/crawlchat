import { authenticator } from "~/auth";
import type { Route } from "./+types/google";

export const loader = async ({ request }: Route.LoaderArgs) => {
  return await authenticator.authenticate("google", request);
};
