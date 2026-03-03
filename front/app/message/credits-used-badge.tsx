import type { CreditTransaction } from "@packages/common/prisma";
import { useMemo } from "react";
import { TbCoins } from "react-icons/tb";

export function CreditsUsedBadge({
  creditsUsed,
  llmModel,
  creditTransactions,
}: {
  creditsUsed: number;
  llmModel?: string | null;
  creditTransactions: CreditTransaction[];
}) {
  const total = useMemo(() => {
    if (creditTransactions.length === 0) {
      return undefined;
    }
    return creditTransactions.reduce((acc, ct) => acc + ct.credits, 0) ?? 0;
  }, [creditTransactions]);

  const tooltip = useMemo(() => {
    const parts = llmModel ? [llmModel] : [];
    if (creditTransactions.length > 0) {
      parts.push(`[${creditTransactions.map((ct) => -ct.credits).join(", ")}]`);
    }
    return parts.length > 0 ? parts.join(" - ") : undefined;
  }, [total, creditTransactions]);

  return (
    <div className="tooltip" data-tip={tooltip}>
      <div className="badge badge-accent badge-soft px-2">
        <TbCoins />
        {total !== undefined ? -total : creditsUsed}
      </div>
    </div>
  );
}
