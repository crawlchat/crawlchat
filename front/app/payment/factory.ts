import type { UserPlanProvider } from "@packages/common/prisma";
import { dodoGateway } from "./gateway-dodo";
import { lemonsqueezyGateway } from "./gateway-lemonsqueezy";

export function getPaymentGateway(provider: UserPlanProvider) {
  if (provider === "DODO") {
    return dodoGateway;
  }

  if (provider === "LEMONSQUEEZY") {
    return lemonsqueezyGateway;
  }
}
