import { CircleDollarSign, Receipt, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActionRequiredCard } from "../components/dashboard/ActionRequiredCard";
import { CategorizationFeed } from "../components/dashboard/CategorizationFeed";
import { MetricCard } from "../components/dashboard/MetricCard";
import { OptimizationNudgeCard } from "../components/optimization/OptimizationNudgeCard";
import { EmptyState } from "../components/state/EmptyState";
import { LoadingState } from "../components/state/LoadingState";
import { getCurrentUser, getDashboardData } from "../services/mockApi";
import type { DashboardResponse, } from "../types/api";
import type { UserProfile } from "../types/domain";
import { formatCurrency } from "../utils/taxMath";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setIsLoading(true);
      const [dash, profile] = await Promise.all([getDashboardData(), getCurrentUser()]);
      if (!alive) return;
      setDashboard(dash);
      setUser(profile);
      setIsLoading(false);
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const pendingDeductions = useMemo(
    () => dashboard?.deductions.filter((d) => d.status !== "claimed").length ?? 0,
    [dashboard?.deductions]
  );

  if (isLoading) {
    return <LoadingState title="Dashboard" description="AI is analyzing your transactions and deduction opportunities..." />;
  }

  if (!dashboard || dashboard.transactions.length === 0) {
    return <EmptyState title="No transactions yet" description="Connect your bank or upload receipts to populate your dashboard." />;
  }

  return (
    <div className="space-y-4 animate-rise">
      <header className="bento-card p-5">
        <p className="text-xs uppercase tracking-widest text-neon-cyan">Main Workspace</p>
        <h1 className="text-3xl font-black text-white">Welcome back, {user?.fullName.split(" ")[0] ?? "Creator"}</h1>
        <p className="mt-2 text-slate-300">Your tax posture is improving. Keep pushing to lock in deductions before filing.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Total Income"
          value={formatCurrency(dashboard.metrics.totalIncome)}
          subtext="Across linked 1099 and payout platforms"
          icon={<CircleDollarSign className="h-4 w-4" />}
          accent="cyan"
        />
        <MetricCard
          label="Estimated Tax Liability"
          value={formatCurrency(dashboard.metrics.estimatedTaxLiability)}
          subtext="Projected with current deductions"
          icon={<ShieldCheck className="h-4 w-4" />}
          accent="amber"
        />
        <MetricCard
          label="Deductions Found"
          value={formatCurrency(dashboard.metrics.totalDeductionsFound)}
          subtext="Potentially claimable this year"
          icon={<Receipt className="h-4 w-4" />}
          accent="mint"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <CategorizationFeed transactions={dashboard.transactions} />
        <div className="space-y-4">
          <ActionRequiredCard pendingCount={pendingDeductions} />
          <OptimizationNudgeCard
            signal={dashboard.optimizationSignals[0]}
            stateCode={user?.state ?? "CA"}
            marginalTaxRate={user?.estimatedMarginalTaxRate ?? 0.24}
          />
        </div>
      </section>
    </div>
  );
}
