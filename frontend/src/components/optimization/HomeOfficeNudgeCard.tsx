import { DollarSign, Home } from "lucide-react";
import { useMemo, useState } from "react";
import type { HomeOfficeOptimizationSignal } from "../../types/domain";
import { formatCurrency, getEstimatedTaxSavings } from "../../utils/taxMath";

interface HomeOfficeNudgeCardProps {
  signal: HomeOfficeOptimizationSignal;
  marginalTaxRate: number;
  onReviewComplete?: () => void;
  onDismiss?: () => void;
}

/** Demo-only simplified home office deduction: $5/sqft × business-use share, capped at $1,500 (IRS simplified style). */
function estimateSimplifiedDeduction(sqFt: number, businessUsePercent: number): number {
  const share = Math.min(1, Math.max(0, businessUsePercent / 100));
  const eligibleSqFt = sqFt * share;
  const raw = Math.round(eligibleSqFt * 5);
  return Math.min(1500, raw);
}

export function HomeOfficeNudgeCard({ signal, marginalTaxRate, onReviewComplete, onDismiss }: HomeOfficeNudgeCardProps) {
  const [squareFeet, setSquareFeet] = useState(signal.workspaceSqFt);
  const [businessUsePercent, setBusinessUsePercent] = useState(signal.suggestedBusinessUsePercent);

  const deductionAmount = useMemo(
    () => estimateSimplifiedDeduction(squareFeet, businessUsePercent),
    [squareFeet, businessUsePercent]
  );

  const taxSavings = useMemo(
    () => getEstimatedTaxSavings(deductionAmount, marginalTaxRate),
    [deductionAmount, marginalTaxRate]
  );

  const sliderPct = businessUsePercent;

  return (
    <section className="bento-card" style={{ padding: "24px" }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
          >
            <Home className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "rgba(245,158,11,0.9)" }}>
              Space × business use
            </p>
            <h2 className="text-[16px] font-extrabold text-[#EDEDED] leading-tight">
              Home office deduction
            </h2>
            <p className="text-[12px] mt-1.5 leading-snug" style={{ color: "#666666" }}>
              Simplified method for demo — $5 per sq ft of qualifying space, capped at $1,500.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <label className="space-y-1.5">
          <span className="text-[12px] font-medium" style={{ color: "#888888" }}>
            Workspace size (sq ft)
          </span>
          <input
            type="number"
            min={50}
            max={500}
            value={squareFeet}
            onChange={(e) => setSquareFeet(Number(e.target.value) || 0)}
            className="giga-input mn"
          />
        </label>
        <div className="space-y-1.5">
          <span className="text-[12px] font-medium" style={{ color: "#888888" }}>
            Business use of that space
          </span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={5}
              max={100}
              value={businessUsePercent}
              onChange={(e) => setBusinessUsePercent(Number(e.target.value))}
              className="flex-1"
              style={{
                background: `linear-gradient(
                  to right,
                  #F59E0B 0%,
                  #F59E0B ${sliderPct}%,
                  rgba(255,255,255,0.1) ${sliderPct}%,
                  rgba(255,255,255,0.1) 100%
                )`,
              }}
            />
            <span className="mn w-12 text-right text-[13px] font-semibold text-[#EDEDED]">
              {businessUsePercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className="rounded-xl px-4 py-4"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.22)",
          }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] mb-2" style={{ color: "rgba(245,158,11,0.85)" }}>
            Estimated deduction
          </p>
          <p className="mn text-[1.6rem] font-bold text-[#EDEDED] leading-none">
            {formatCurrency(deductionAmount)}
          </p>
          <p className="text-[11px] mt-1.5" style={{ color: "#555555" }}>
            Demo calculation — not filing advice
          </p>
        </div>

        <div
          className="rounded-xl px-4 py-4"
          style={{
            background: "rgba(0,255,133,0.06)",
            border: "1px solid rgba(0,255,133,0.25)",
            boxShadow: "0 0 28px rgba(0,255,133,0.07)",
          }}
        >
          <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] mb-2" style={{ color: "rgba(0,255,133,0.75)" }}>
            <DollarSign className="h-3 w-3" />
            Estimated tax savings
          </p>
          <p className="mn text-[1.6rem] font-bold leading-none" style={{ color: "#00FF85" }}>
            {formatCurrency(taxSavings)}
          </p>
          <p className="text-[11px] mt-1.5" style={{ color: "#555555" }}>
            At your {(marginalTaxRate * 100).toFixed(0)}% marginal rate
          </p>
        </div>
      </div>

      {onReviewComplete ? (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={onReviewComplete}
              className="w-full rounded-xl px-4 py-3 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.99]"
              style={{
                background: "rgba(0,255,133,0.12)",
                border: "1px solid rgba(0,255,133,0.35)",
                color: "#00FF85",
                boxShadow: "0 0 22px rgba(0,255,133,0.12)",
              }}
            >
              Confirm and complete review
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="w-full rounded-xl px-4 py-3 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.99]"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "#AAAAAA",
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
