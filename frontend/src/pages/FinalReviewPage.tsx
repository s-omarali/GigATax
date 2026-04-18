import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingState } from "../components/state/LoadingState";
import { SuccessState } from "../components/state/SuccessState";
import { getDashboardData } from "../services/mockApi";
import type { DashboardResponse } from "../types/api";
import { formatCurrency } from "../utils/taxMath";

export function FinalReviewPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filed, setFiled] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      setIsLoading(true);
      const data = await getDashboardData();
      if (!alive) return;
      setDashboard(data);
      setIsLoading(false);
    }
    void load();

    return () => {
      alive = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState title="Final Review" description="Preparing your filing summary..." />;
  }

  if (filed) {
    return <SuccessState title="Filing submitted" description="Your filing package was sent successfully. We will notify you when status updates arrive." />;
  }

  if (!dashboard) {
    return null;
  }

  const totalExpenses = dashboard.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-4 animate-rise">
      <header className="bento-card p-5">
        <p className="text-xs uppercase tracking-wider text-neon-cyan">Final Review & Filing</p>
        <h1 className="text-3xl font-black text-white">High-Trust Tax Summary</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bento-card p-4">
          <p className="text-xs uppercase text-slate-400">Income</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(dashboard.metrics.totalIncome)}</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-xs uppercase text-slate-400">Categorized Expenses</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-xs uppercase text-slate-400">Estimated Taxes Due</p>
          <p className="text-2xl font-bold text-neon-amber">{formatCurrency(dashboard.metrics.estimatedTaxLiability)}</p>
        </div>
      </section>

      <section className="bento-card p-5">
        <h2 className="mb-4 text-xl font-bold text-white">Expense Breakdown</h2>
        <div className="space-y-2">
          {dashboard.deductions.map((deduction) => (
            <div key={deduction.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-sm">
              <span className="text-slate-200">{deduction.title}</span>
              <span className="font-semibold text-neon-mint">{formatCurrency(deduction.potentialSavings)}</span>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={() => setFiled(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-neon-mint bg-neon-mint/20 px-5 py-3 text-sm font-bold text-neon-mint"
      >
        <ShieldCheck className="h-4 w-4" />
        File Taxes
      </button>
    </div>
  );
}
