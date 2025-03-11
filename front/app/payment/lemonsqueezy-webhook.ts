import { prisma } from "libs/prisma";
import type { Route } from "./+types/lemonsqueezy-webhook";
import crypto from "crypto";
import {
  PLAN_STARTER,
  PLAN_PRO,
  activatePlan,
  consumeCredits,
  addTopup,
} from "libs/user-plan";
import type { Plan } from "libs/user-plan";

const productIdPlanMap: Record<number, Plan> = {
  404106: PLAN_STARTER,
  404102: PLAN_PRO,
};

function validateRequest(headers: Headers, body: string) {
  const xSignature = headers.get("x-signature");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET as string;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
  const signature = Buffer.from(
    Array.isArray(xSignature) ? xSignature.join("") : xSignature || "",
    "utf8"
  );

  return crypto.timingSafeEqual(digest, signature);
}

export async function action({ request }: Route.ActionArgs) {
  const body = await request.text();

  if (!validateRequest(request.headers, body)) {
    console.log("Invalid Lemonsqueezy webhook");
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const payload = JSON.parse(body);
  console.log("Received Lemonsqueezy webhook", payload.meta.webhook_id);

  // Get user and 400 if not found
  const userEmail = payload.data.attributes.user_email;
  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });
  if (!user) {
    return Response.json({ message: "User not found" }, { status: 400 });
  }

  const eventName = payload.meta.event_name;

  if (eventName === "order_created") {
    const productId = payload.data.attributes.first_order_item.product_id;
    const plan = productIdPlanMap[productId];

    if (!plan) {
      return Response.json({ message: "Plan not found" }, { status: 400 });
    }
    if (plan.type !== "ONE_TIME") {
      return Response.json(
        { message: "Plan is not one-time" },
        { status: 400 }
      );
    }

    if (plan.category === "BASE") {
      await activatePlan(user.id, plan, {
        provider: "LEMONSQUEEZY",
        orderId: payload.data.id,
      });
    } else if (plan.category === "TOPUP") {
      await addTopup(user.id, plan, {
        provider: "LEMONSQUEEZY",
        orderId: payload.data.id,
      });

      for (const [type, amount] of Object.entries(plan.credits)) {
        await consumeCredits(user.id, type as "messages" | "scrapes", -amount);
      }
    }

    return Response.json({ message: "Activated one-time plan" });
  }

  if (eventName === "subscription_created") {
    const productId = payload.data.attributes.product_id;
    const plan = productIdPlanMap[productId];

    if (!plan) {
      return Response.json({ message: "Plan not found" }, { status: 400 });
    }

    await activatePlan(user.id, plan, {
      provider: "LEMONSQUEEZY",
      subscriptionId: payload.data.id,
    });

    return Response.json({ message: "Activated subscription plan" });
  }

  if (
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired"
  ) {
    const productId = payload.data.attributes.product_id;
    const plan = productIdPlanMap[productId];

    if (!plan) {
      return Response.json({ message: "Plan not found" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: {
          upsert: {
            set: {
              planId: plan.id,
              type: plan.type,
              provider: "LEMONSQUEEZY",
              status: "EXPIRED",
              activatedAt: new Date(),
            },
            update: { status: "EXPIRED" },
          },
        },
      },
    });

    return Response.json({ message: "Updated plan to expired" });
  }

  if (eventName === "subscription_resumed") {
    const productId = payload.data.attributes.product_id;
    const plan = productIdPlanMap[productId];

    if (!plan) {
      return Response.json({ message: "Plan not found" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: {
          upsert: {
            set: {
              planId: plan.id,
              type: plan.type,
              provider: "LEMONSQUEEZY",
              status: "ACTIVE",
              activatedAt: new Date(),
            },
            update: { status: "ACTIVE" },
          },
        },
      },
    });

    return Response.json({ message: "Updated plan to active" });
  }

  return Response.json({ message: "Unknown event" }, { status: 400 });
}
