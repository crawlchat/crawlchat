import type { Route } from "./+types/lemonsqueezy-webhook";
import { handleWebhook } from "./webhook-handler";
import { dodoGateway } from "./gateway-dodo";

export async function action({ request }: Route.ActionArgs) {
  return handleWebhook(request, dodoGateway);
}
