import type { Plan } from "libs/user-plan";
import { useEffect } from "react";
import { TbCrown } from "react-icons/tb";
import { useFetcher } from "react-router";
import { PricingBoxes } from "~/landing/page";
import { track } from "~/track";

export function UpgradeModal({
  starterPlan,
  proPlan,
  hobbyPlan,
}: {
  starterPlan: Plan;
  proPlan: Plan;
  hobbyPlan: Plan;
}) {
  const paymentFetcher = useFetcher();

  useEffect(() => {
    if (paymentFetcher.data) {
      location.href = paymentFetcher.data.url;
    }
  }, [paymentFetcher.data]);

  function handlePayClick(planId: string) {
    track("upgrade", {
      plan_id: planId,
    });

    paymentFetcher.submit(
      {
        intent: "payment-link",
        referralId: (window as any).affonso_referral,
        planId,
      },
      {
        method: "POST",
        action: "/app",
      }
    );
  }

  return (
    <dialog id="upgrade-modal" className="modal z-90">
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-4">
          <PricingBoxes
            starterPlan={starterPlan}
            proPlan={proPlan}
            hobbyPlan={hobbyPlan}
            onClick={handlePayClick}
          />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
