import type { Plan } from "libs/user-plan";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { PricingBoxes, PricingSwitch } from "~/landing/page";

export function UpgradeModal({
  launchPlan,
  launchYearlyPlan,
  growPlan,
  growYearlyPlan,
  acceleratePlan,
  accelerateYearlyPlan,
}: {
  launchPlan: Plan;
  launchYearlyPlan: Plan;
  growPlan: Plan;
  growYearlyPlan: Plan;
  acceleratePlan: Plan;
  accelerateYearlyPlan: Plan;
}) {
  const paymentFetcher = useFetcher();
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    if (paymentFetcher.data) {
      location.href = paymentFetcher.data.url;
    }
  }, [paymentFetcher.data]);

  return (
    <dialog id="upgrade-modal" className="modal z-90">
      <div
        className="modal-box w-11/12 max-w-5xl flex flex-col gap-8"
        style={{ paddingTop: "40px" }}
      >
        <PricingSwitch yearly={yearly} setYearly={setYearly} />
        <div className="flex flex-col md:flex-row gap-4">
          <PricingBoxes
            launchPlan={launchPlan}
            launchYearlyPlan={launchYearlyPlan}
            growPlan={growPlan}
            growYearlyPlan={growYearlyPlan}
            acceleratePlan={acceleratePlan}
            accelerateYearlyPlan={accelerateYearlyPlan}
            yearly={yearly}
          />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
