import {
  ArrowRight,
  CircleDollarSign,
  Receipt,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ActionRequiredCard } from "../components/dashboard/ActionRequiredCard";
import { CategorizationFeed } from "../components/dashboard/CategorizationFeed";
import { MetricCard } from "../components/dashboard/MetricCard";
import { OptimizationNudgeCard } from "../components/optimization/OptimizationNudgeCard";
import { EmptyState } from "../components/state/EmptyState";
import { LoadingState } from "../components/state/LoadingState";
import { mockTransactionsByCategory } from "../data/mockData";
import { getCurrentUser, getDashboardData } from "../services/mockApi";
import type { DashboardResponse } from "../types/api";
import type { Transaction, TransactionCategory, UserProfile } from "../types/domain";
import { formatCurrency } from "../utils/taxMath";

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedFeedCategory, setSelectedFeedCategory] = useState<"All" | TransactionCategory>("All");

  useEffect(() => {
    let alive = true;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [dash, profile] = await Promise.all([getDashboardData(), getCurrentUser()]);
        if (!alive) return;
        setDashboard(dash);
        setUser(profile);
      } catch (error) {
        if (!alive) return;
        setLoadError(error instanceof Error ? error.message : "Unable to load dashboard data.");
      }
      if (!alive) return;
      setIsLoading(false);
    }

    void load();
    return () => { alive = false; };
  }, []);

  const pendingDeductions = useMemo(
    () => dashboard?.deductions.filter((d) => d.status !== "claimed").length ?? 0,
    [dashboard?.deductions]
  );

  const aiFeedTransactions = useMemo<Transaction[]>(() => {
    if (selectedFeedCategory === "All") {
      return Object.values(mockTransactionsByCategory)
        .flat()
        .sort((a, b) => b.date.localeCompare(a.date));
    }
    return mockTransactionsByCategory[selectedFeedCategory] ?? [];
  }, [selectedFeedCategory]);

  function asTransactionCategory(value: string): TransactionCategory | null {
    const categories: TransactionCategory[] = [
      "Income",
      "Software",
      "Travel",
      "Meals",
      "Vehicle",
      "Home Office",
      "Supplies",
      "Uncategorized",
    ];
    return categories.includes(value as TransactionCategory) ? (value as TransactionCategory) : null;
  }

  if (isLoading) {
    return <LoadingState title="Dashboard" description="AI is analyzing your transactions and deduction opportunities..." />;
  }

  if (loadError) {
    return <EmptyState title="Dashboard data unavailable" description={loadError} />;
  }

  if (!dashboard || dashboard.transactions.length === 0) {
    return <EmptyState title="No transactions yet" description="Connect your bank or upload receipts to populate your dashboard." />;
  }

  const firstName = user?.fullName.split(" ")[0] ?? "Creator";

  return (
    <div className="space-y-6 animate-rise">

      {/* ── PINNED HERO DIRECTIVE — dominant above everything ─────── */}
      {pendingDeductions > 0 && (
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.04) 100%)",
            border: "1px solid rgba(59,130,246,0.28)",
            boxShadow: "0 0 40px rgba(59,130,246,0.08)",
          }}
        >
          {/* Subtle glow blob */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl"
            style={{ background: "rgba(59,130,246,0.12)" }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <ShieldCheck className="h-5 w-5" style={{ color: "#3B82F6" }} />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#EDEDED] leading-snug">
                  You have {pendingDeductions} deduction{pendingDeductions !== 1 ? "s" : ""} to review
                </p>
                <p className="text-[13px] mt-0.5" style={{ color: "#888888" }}>
                  GigATax identified potential savings — confirm them before filing to lock in your refund.
                </p>
              </div>
            </div>
            <a
              href="/optimization"
              className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "#3B82F6",
                color: "#ffffff",
                boxShadow: "0 0 20px rgba(59,130,246,0.25)",
              }}
            >
              Review Now <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(0,255,133,0.7)" }}>
            Command Center
          </p>
          <h1 className="text-[1.6rem] font-bold text-[#EDEDED] leading-tight">
            Hey, {firstName}
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "#888888" }}>
            Tax Year 2026 · California · {user?.estimatedMarginalTaxRate ? `${(user.estimatedMarginalTaxRate * 100).toFixed(0)}% tax bracket` : ""}
          </p>
        </div>
        {/* Quick CTA */}
        <a
          href="/filing-prep"
          className="hidden md:flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150"
          style={{
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            color: "#3B82F6",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(59,130,246,0.2)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(59,130,246,0.12)"; }}
        >
          <TrendingUp className="h-4 w-4" />
          Review & File
        </a>
      </div>

      {/* ── HERO — Total Tax Savings ────────────────────────────────── */}
      {/* This is the #1 DOM priority. Largest, most visually striking element. */}
      <MetricCard
        label="Total Tax Savings Identified"
        value={formatCurrency(dashboard.metrics.totalDeductionsFound)}
        subtext={`${dashboard.deductions.filter((d) => d.status === "claimed").length} deductions claimed · ${pendingDeductions} pending your review`}
        icon={<TrendingUp className="h-5 w-5" />}
        accent="green"
        hero
      />

      {/* ── Metric row ─────────────────────────────────────────────── */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <MetricCard
          label="Total 1099 Income"
          value={formatCurrency(dashboard.metrics.totalIncome)}
          subtext="Across linked payout platforms"
          icon={<CircleDollarSign className="h-4 w-4" />}
          accent="blue"
        />
        <MetricCard
          label="Estimated Tax Liability"
          value={formatCurrency(dashboard.metrics.estimatedTaxLiability)}
          subtext="With current deductions applied"
          icon={<ShieldCheck className="h-4 w-4" />}
          accent="amber"
        />
      </section>

      {/* ── Bento grid: AI Feed + right-rail ───────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* AI Activity Feed — left, dominant */}
        <CategorizationFeed
          transactions={aiFeedTransactions}
          selectedCategory={selectedFeedCategory}
          onSelectCategory={setSelectedFeedCategory}
        />

        {/* Right rail */}
        <div className="space-y-6">
          <ActionRequiredCard pendingCount={pendingDeductions} />

          {/* Deductions claimed summary */}
          <div className="bento-card" style={{ padding: "20px" }}>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(0,255,133,0.1)", color: "#00FF85" }}
              >
                <Receipt className="h-4 w-4" />
              </div>
              <h2 className="text-[13px] font-semibold text-[#EDEDED]">Deduction Status</h2>
            </div>
            <div className="space-y-2">
              {dashboard.deductions.map((ded) => (
                <div
                  key={ded.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                  onClick={() => {
                    const txCategory = asTransactionCategory(ded.category);
                    if (txCategory) {
                      setSelectedFeedCategory(txCategory);
                    }
                  }}
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#EDEDED] truncate">{ded.title}</p>
                    <p className="text-[11px] text-[#555555]">{ded.detail}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-3">
                    <p className="mn text-[13px] font-semibold" style={{ color: "#00FF85" }}>
                      +{formatCurrency(ded.potentialSavings)}
                    </p>
                    <span
                      className="chip mt-0.5"
                      style={
                        ded.status === "claimed"
                          ? { background: "rgba(0,255,133,0.1)", color: "#00FF85" }
                          : ded.status === "in_progress"
                          ? { background: "rgba(59,130,246,0.1)", color: "#3B82F6" }
                          : { background: "rgba(255,255,255,0.06)", color: "#888888" }
                      }
                    >
                      {ded.status === "claimed" ? "Claimed" : ded.status === "in_progress" ? "In progress" : "Available"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Optimization Nudge ─────────────────────────────────────── */}
      {dashboard.optimizationSignals[0] && (
        <OptimizationNudgeCard
          signal={dashboard.optimizationSignals[0]}
          stateCode={user?.state ?? "CA"}
          marginalTaxRate={user?.estimatedMarginalTaxRate ?? 0.24}
        />
      )}
    </div>
  );
}
