import { planMap } from "@packages/common/plans";
import { useContext } from "react";
import { TbCrown } from "react-icons/tb";
import { AppContext } from "./components/app-context";

export function FromPlanBadge({ fromPlanId }: { fromPlanId: string }) {
  const { isFeatureEnabled } = useContext(AppContext);
  const enabled = isFeatureEnabled(fromPlanId);

  if (enabled) return null;

  const plan = planMap[fromPlanId];

  return (
    <span className="badge badge-soft badge-primary">
      <TbCrown />
      {plan.name}
    </span>
  );
}
