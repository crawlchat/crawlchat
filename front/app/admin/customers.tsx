import type { Route } from "./+types/customers";
import { prisma } from "@packages/common/prisma";
import { redirect, Link } from "react-router";
import { getAuthUser } from "~/auth/middleware";
import { makeMeta } from "~/meta";
import { PLAN_FREE, planMap } from "@packages/common/user-plan";
import { adminEmails } from "./emails";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedInUser = await getAuthUser(request);

  if (!adminEmails.includes(loggedInUser!.email)) {
    throw redirect("/app");
  }

  const users = await prisma.user.findMany({
    where: {
      plan: {
        is: {
          planId: { not: PLAN_FREE.id },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customerData = await Promise.all(
    users.map(async (user) => {
      const plan = planMap[user.plan?.planId ?? PLAN_FREE.id];
      const allowedScrapes = plan.limits.scrapes;

      const scrapes = await prisma.scrape.count({
        where: {
          userId: user.id,
        },
      });

      const usedScrapes = scrapes;

      const allowedMessages = plan.credits.messages;
      const remainingMessages = user.plan?.credits?.messages ?? 0;
      const usedMessages = allowedMessages - remainingMessages;

      const billingCycleStart =
        user.plan?.creditsResetAt ?? user.plan?.activatedAt;

      const messageCost = billingCycleStart
        ? await prisma.message.aggregate({
            where: {
              ownerUserId: user.id,
              createdAt: { gte: billingCycleStart },
              llmCost: { not: null },
            },
            _sum: {
              llmCost: true,
            },
          })
        : null;

      const analysisCost = billingCycleStart
        ? ((await prisma.message.aggregateRaw({
            pipeline: [
              {
                $match: {
                  ownerUserId: { $oid: user.id },
                  createdAt: {
                    $gte: { $date: billingCycleStart.toISOString() },
                  },
                  analysis: { $ne: null },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$analysis.cost" },
                },
              },
            ],
          })) as unknown as Array<{ total?: number }>)
        : null;

      const monthStart = new Date(
        new Date().setMonth(new Date().getMonth(), 1)
      );

      const mtdCost = await prisma.message.aggregate({
        where: {
          ownerUserId: user.id,
          createdAt: { gte: monthStart },
          llmCost: { not: null },
        },
        _sum: {
          llmCost: true,
        },
      });

      const mtdAnalysisCost = (await prisma.message.aggregateRaw({
        pipeline: [
          {
            $match: {
              ownerUserId: { $oid: user.id },
              createdAt: { $gte: { $date: monthStart.toISOString() } },
              analysis: { $ne: null },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$analysis.cost" },
            },
          },
        ],
      })) as unknown as Array<{ total?: number }>;

      return {
        id: user.id,
        email: user.email,
        planName: plan.name,
        planId: plan.id,
        allowedScrapes,
        usedScrapes,
        allowedMessages,
        usedMessages,
        billingCycleStart: billingCycleStart?.toISOString() ?? null,
        messageCost: messageCost?._sum?.llmCost ?? 0,
        analysisCost: analysisCost?.[0]?.total ?? 0,
        mtdCost: mtdCost?._sum?.llmCost ?? 0,
        mtdAnalysisCost: mtdAnalysisCost?.[0]?.total ?? 0,
      };
    })
  );

  return { customers: customerData };
}

export function meta() {
  return makeMeta({
    title: "Customers - Admin",
  });
}

export default function Customers({ loaderData }: Route.ComponentProps) {
  const { customers } = loaderData;

  const totalCost = customers.reduce(
    (acc, customer) => acc + customer.mtdCost + customer.mtdAnalysisCost,
    0
  );

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers ({customers.length})</h1>
        <Link to="/admin-fowl" className="link link-primary link-hover">
          Back to Admin
        </Link>
      </div>

      <div className="text-2xl font-bold">
        MTD Cost: ${totalCost.toFixed(4)}
      </div>

      <div className="overflow-x-auto border border-base-300 rounded-box bg-base-100 shadow">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Plan</th>
              <th>Collections</th>
              <th>Messages</th>
              <th>Billing Cycle Start</th>
              <th>Cost [B]</th>
              <th>Cost [MTD]</th>
              <th>Analysis Cost</th>
              <th>Analysis Cost [MTD]</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <Link
                    to={`/admin-fowl/user/${customer.id}`}
                    className="link link-primary link-hover"
                  >
                    {customer.email}
                  </Link>
                </td>
                <td>
                  <span className="badge badge-soft badge-neutral">
                    {customer.planName}
                  </span>
                </td>
                <td>
                  {customer.usedScrapes} / {customer.allowedScrapes}
                </td>
                <td>
                  {customer.usedMessages} / {customer.allowedMessages}
                </td>
                <td>
                  {customer.billingCycleStart
                    ? new Date(customer.billingCycleStart).toLocaleDateString()
                    : "-"}
                </td>
                <td>${customer.messageCost.toFixed(4)}</td>
                <td>${customer.mtdCost.toFixed(4)}</td>
                <td>${customer.analysisCost.toFixed(4)}</td>
                <td>${customer.mtdAnalysisCost.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
