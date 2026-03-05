import { addCreditTransaction } from "@packages/common/credit-transaction";
import { prisma } from "@packages/common/prisma";
import { Link, redirect, useFetcher } from "react-router";
import { Toaster } from "react-hot-toast";
import { getAuthUser } from "~/auth/middleware";
import { useFetcherToast } from "~/components/use-fetcher-toast";
import { makeMeta } from "~/meta";
import type { Route } from "./+types/add-credit";
import { adminEmails } from "./emails";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);

  if (!adminEmails.includes(user!.email)) {
    throw redirect("/app");
  }

  return {};
}

export function meta() {
  return makeMeta({
    title: "Add Credit Transaction - Admin",
  });
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getAuthUser(request);

  if (!adminEmails.includes(user!.email)) {
    throw redirect("/app");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add-credit") {
    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const amountStr = formData.get("amount") as string;
    const description = (formData.get("description") as string)?.trim();
    const type = formData.get("type") as string;

    if (!email) {
      return { error: "Email is required" };
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount === 0) {
      return { error: "Amount cannot be zero" };
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });

    if (!targetUser) {
      return { error: "User not found" };
    }

    await addCreditTransaction(
      targetUser.id,
      type as any,
      "message",
      description || `Admin credit: ${amount} messages`,
      amount
    );

    throw redirect("/admin-fowl");
  }

  return { error: "Invalid intent" };
}

export default function AddCredit() {
  const fetcher = useFetcher();

  useFetcherToast(fetcher);

  return (
    <div className="p-4 flex flex-col gap-4 max-w-md">
      <Link to="/admin-fowl" className="link link-primary link-hover">
        ← Back to Admin
      </Link>
      <h1 className="text-2xl font-bold">Add Credit Transaction</h1>
      <fetcher.Form method="post" className="flex flex-col gap-4">
        <input type="hidden" name="intent" value="add-credit" />
        <div className="form-control">
          <label className="label" htmlFor="type">
            <span className="label-text">Type</span>
          </label>
          <select
            id="type"
            name="type"
            required
            className="select select-bordered w-full"
          >
            <option value="topup">topup</option>
            <option value="usage">usage</option>
            <option value="subscription">subscription</option>
            <option value="migration">migration</option>
            <option value="expired">expired</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label" htmlFor="email">
            <span className="label-text">User Email</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input input-bordered w-full"
            placeholder="user@example.com"
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="amount">
            <span className="label-text">Amount</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            required

            step="0.01"
            className="input input-bordered w-full"
            placeholder="100"
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="description">
            <span className="label-text">Description</span>
          </label>
          <input
            id="description"
            name="description"
            type="text"
            className="input input-bordered w-full"
            placeholder="Manual credit adjustment"
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="purpose">
            <span className="label-text">Purpose</span>
          </label>
          <input
            id="purpose"
            name="purpose"
            type="text"
            value="message"
            disabled
            className="input input-bordered w-full bg-base-200"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={fetcher.state !== "idle"}
        >
          {fetcher.state !== "idle" && (
            <span className="loading loading-spinner" />
          )}
          Add Credits
        </button>
      </fetcher.Form>
      <Toaster />
    </div>
  );
}
