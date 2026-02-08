import { TbCurrencyDollar } from "react-icons/tb";

export function CostBadge({
  cost,
  llmModel,
}: {
  cost: number;
  llmModel?: string | null;
}) {
  return (
    <div className="tooltip" data-tip={llmModel}>
      <div className="badge badge-accent badge-soft px-2">
        <TbCurrencyDollar />
        {cost.toFixed(2)}
      </div>
    </div>
  );
}
