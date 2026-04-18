import type { Transaction } from "../../types/domain";
import { formatCurrency } from "../../utils/taxMath";

interface CategorizationFeedProps {
  transactions: Transaction[];
}

export function CategorizationFeed({ transactions }: CategorizationFeedProps) {
  return (
    <section className="bento-card p-5">
      <h2 className="text-lg font-semibold text-white">Auto-Categorized Transactions</h2>
      <p className="mt-1 text-sm text-slate-400">Read-only feed of what AI recently classified.</p>
      <div className="mt-4 space-y-3">
        {transactions.slice(0, 5).map((txn) => (
          <div key={txn.id} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/50 px-3 py-2">
            <div>
              <p className="font-medium text-slate-100">{txn.merchant}</p>
              <p className="text-xs text-slate-400">{txn.date} • {txn.category}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${txn.type === "income" ? "text-neon-mint" : "text-slate-200"}`}>
                {txn.type === "income" ? "+" : "-"}{formatCurrency(txn.amount)}
              </p>
              <p className="text-xs text-slate-500">{Math.round(txn.confidenceScore * 100)}% confidence</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
