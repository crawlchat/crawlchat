import { getAuthUser } from "~/auth/middleware";
import type { Route } from "./+types/change-plan-dodo";
import { redirect } from "react-router";
import { DodoPayments } from "dodopayments";
import { prisma } from "libs/prisma";
import { planMap, activatePlan } from "libs/user-plan";
import { planProductIdMap } from "~/payment/gateway-dodo";

const client = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment:
    (process.env.DODO_ENVIRONMENT as "live_mode" | "test_mode" | undefined) ??
    "live_mode",
});

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  if (user?.email !== "pramodkumar.damam73@gmail.com") {
    throw redirect("/app");
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email")?.toLowerCase();
  const planId = url.searchParams.get("planId");
  const prorationBillingMode =
    (url.searchParams.get("prorationBillingMode") as
      | "prorated_immediately"
      | "full_immediately"
      | "difference_immediately"
      | null) ?? "prorated_immediately";

  if (!email || !planId) {
    return new Response(
      JSON.stringify({ error: "email and planId query parameters are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const plan = planMap[planId];
  const productId = planProductIdMap[planId];

  if (!plan || !productId) {
    return new Response(JSON.stringify({ error: "Invalid planId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });

  if (!targetUser) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (targetUser.plan?.provider !== "DODO") {
    return new Response(JSON.stringify({ error: "User is not on Dodo" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subscriptionId = targetUser.plan?.subscriptionId;
  if (!subscriptionId) {
    return new Response(JSON.stringify({ error: "User has no subscriptionId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const updatedSubscription = await client.subscriptions.changePlan(
    subscriptionId,
    {
      product_id: productId,
      quantity: 1,
      proration_billing_mode: prorationBillingMode,
    }
  );

  await activatePlan(targetUser.id, plan, {
    provider: "DODO",
    subscriptionId,
  });

  return new Response(
    JSON.stringify({
      success: true,
      subscriptionId,
      planId,
      productId,
      prorationBillingMode,
      updatedSubscription,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

