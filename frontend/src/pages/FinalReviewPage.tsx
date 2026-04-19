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
    return () => { alive = false; };
  }, []);

  if (isLoading) return <LoadingState title="Final review" description="Pulling your numbers together…" />;
  if (filed) return <SuccessState title="You're good." description="We sent your filing package. We'll notify you when the status updates." />;
  if (!dashboard) return null;

  const totalExpenses = dashboard.transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(0,255,133,0.75)" }}>
          Final pass
        </p>
        <h1 className="text-[1.6rem] font-extrabold text-[#EDEDED] leading-tight">Review before you file</h1>
        <p className="text-[13px] mt-2" style={{ color: "#888888" }}>
          Income, expenses, and deductions — in one place so you can sign off with confidence.
        </p>
      </div>

      <section className="grid gap-6 sm:grid-cols-3">
        {[
          { label: "Total income", value: formatCurrency(dashboard.metrics.totalIncome), color: "#00FF85" },
          { label: "Categorized expenses", value: formatCurrency(totalExpenses), color: "#EDEDED" },
          { label: "What you owe (estimate)", value: formatCurrency(dashboard.metrics.estimatedTaxLiability), color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bento-card" style={{ padding: "22px" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: "#888888" }}>{label}</p>
            <p className="mn text-[1.5rem] font-bold leading-none" style={{ color }}>{value}</p>
          </div>
        ))}
      </section>

      <section className="bento-card" style={{ padding: "24px" }}>
        <h2 className="text-[15px] font-extrabold text-[#EDEDED] mb-4">Where the money went</h2>
        <div className="space-y-2">
          {dashboard.deductions.map((ded) => (
            <div
              key={ded.id}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <p className="text-[13px] font-medium text-[#EDEDED]">{ded.title}</p>
                <p className="text-[11px]" style={{ color: "#666666" }}>{ded.detail}</p>
              </div>
              <p className="mn text-[14px] font-semibold" style={{ color: "#00FF85" }}>
                +{formatCurrency(ded.potentialSavings)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl"
          style={{ background: "rgba(0,255,133,0.2)", transform: "scale(1.04)" }}
        />
        <button
          type="button"
          onClick={() => setFiled(true)}
          className="giga-cta-shimmer relative w-full flex items-center justify-center gap-3 rounded-2xl py-5 text-[16px] font-extrabold tracking-tight transition-all duration-150 active:scale-[0.99] hover:brightness-110"
          style={{
            background: "#00FF85",
            color: "#0a0a0f",
            boxShadow: "0 0 48px rgba(0,255,133,0.35), 0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <ShieldCheck className="h-5 w-5" />
          I&apos;m done — file it
        </button>
      </div>
    </div>
  );
}
