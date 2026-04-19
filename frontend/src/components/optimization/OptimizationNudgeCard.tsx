import { Car, DollarSign, Fuel, Gauge, MapPinned } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getOptimizationMileage } from "../../services/api";
import type { VehicleMileageOptimizationSignal } from "../../types/domain";
import { formatCurrency, formatNumber, getEstimatedTaxSavings } from "../../utils/taxMath";
import { LoadingState } from "../state/LoadingState";

interface OptimizationNudgeCardProps {
  signal: VehicleMileageOptimizationSignal;
  stateCode: string;
  marginalTaxRate: number;
  /** Marks this signal complete app-wide (dashboard badge, Action Required, etc.). */
  onReviewComplete?: () => void;
  onDismiss?: () => void;
}

interface MileageResult {
  averageGasPrice: number;
  estimatedMiles: number;
  allowedDeductionAmount: number;
}

export function OptimizationNudgeCard({
  signal,
  stateCode,
  marginalTaxRate,
  onReviewComplete,
  onDismiss,
}: OptimizationNudgeCardProps) {
  const [selectedState, setSelectedState] = useState(stateCode || "TX");
  const [mpg, setMpg] = useState(24);
  const [businessMiles, setBusinessMiles] = useState(450);
  const [result, setResult] = useState<MileageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSelectedState((stateCode || "TX").slice(0, 2).toUpperCase());
  }, [stateCode]);

  useEffect(() => {
    let isMounted = true;

    async function recalculate() {
      setIsLoading(true);
      const response = await getOptimizationMileage({
        gasSpend: signal.gasSpend,
        state: selectedState,
        mpg,
        businessMiles,
      });
      if (!isMounted) return;

      setResult({
        averageGasPrice: response.averageGasPrice,
        estimatedMiles: response.estimatedMiles,
        allowedDeductionAmount: response.allowedDeductionAmount,
      });
      setIsLoading(false);
    }

    void recalculate();
    return () => { isMounted = false; };
  }, [businessMiles, mpg, selectedState, signal.gasSpend]);

  useEffect(() => {
    if (!result) return;
    if (businessMiles > result.estimatedMiles) {
      setBusinessMiles(Math.max(0, Math.floor(result.estimatedMiles)));
    }
  }, [businessMiles, result]);

  const maxBusinessMiles = useMemo(
    () => Math.max(1, Math.floor(result?.estimatedMiles ?? 1000)),
    [result?.estimatedMiles]
  );

  const taxSavings = useMemo(() => {
    if (!result) return 0;
    return getEstimatedTaxSavings(result.allowedDeductionAmount, marginalTaxRate);
  }, [marginalTaxRate, result]);

  const sliderPct = maxBusinessMiles > 0 ? (Math.min(businessMiles, maxBusinessMiles) / maxBusinessMiles) * 100 : 0;

  if (isLoading && !result) {
    return <LoadingState title="Mileage estimate" description="Crunching miles…" />;
  }

  return (
    <section className="bento-card" style={{ padding: "24px" }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
          >
            <Car className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "rgba(59,130,246,0.85)" }}>
              Gas spend → miles → deduction
            </p>
            <h2 className="text-[16px] font-extrabold text-[#EDEDED] leading-tight">
              Business mileage deduction
            </h2>
            <p className="text-[12px] mt-1.5 leading-snug" style={{ color: "#666666" }}>
              Based on driving for your work — not personal trips.
            </p>
          </div>
        </div>
        <span
          className="chip"
          style={{ background: "rgba(0,255,133,0.1)", color: "#00FF85" }}
        >
          {signal.detectedPeriodLabel}
        </span>
      </div>

      {/* Gas spend observation */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-6"
        style={{
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.2)",
        }}
      >
        <Fuel className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#F59E0B" }} />
        <p className="text-[12px] leading-relaxed" style={{ color: "#EDEDED" }}>
          We detected{" "}
          <span className="mn font-semibold" style={{ color: "#F59E0B" }}>
            {formatCurrency(signal.gasSpend)}
          </span>{" "}
          in gas spend. Using{" "}
          <span className="font-medium">{selectedState.toUpperCase()}</span> avg of{" "}
          <span className="mn font-semibold">{formatCurrency(result?.averageGasPrice ?? 0)}/gal</span>{" "}
          at {mpg} MPG → approximately{" "}
          <span className="mn font-semibold text-[#EDEDED]">
            {formatNumber(result?.estimatedMiles ?? 0)} total miles
          </span>.
        </p>
      </div>

      {/* Config row */}
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#888888" }}>
            <MapPinned className="h-3.5 w-3.5" /> State
          </span>
          <input
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value.toUpperCase())}
            maxLength={2}
            placeholder="TX"
            className="giga-input uppercase"
          />
        </label>
        <label className="space-y-1.5">
          <span className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: "#888888" }}>
            <Gauge className="h-3.5 w-3.5" /> Vehicle MPG
          </span>
          <input
            type="number"
            min={5}
            max={70}
            value={mpg}
            onChange={(e) => setMpg(Number(e.target.value) || 0)}
            className="giga-input"
          />
        </label>
      </div>

      {/* ── THE NUDGE SLIDER ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[13px] font-medium text-[#EDEDED]">
            Business miles driven
          </label>
          <input
            type="number"
            min={0}
            max={maxBusinessMiles}
            value={businessMiles}
            onChange={(e) => setBusinessMiles(Number(e.target.value) || 0)}
            className="mn w-24 rounded-xl px-3 py-1.5 text-[13px] text-right text-[#EDEDED] outline-none"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </div>

        {/* Custom styled range track */}
        <div className="relative">
          <input
            type="range"
            min={0}
            max={maxBusinessMiles}
            value={Math.min(businessMiles, maxBusinessMiles)}
            onChange={(e) => setBusinessMiles(Number(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(
                to right,
                #00FF85 0%,
                #00FF85 ${sliderPct}%,
                rgba(255,255,255,0.1) ${sliderPct}%,
                rgba(255,255,255,0.1) 100%
              )`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px]" style={{ color: "#555555" }}>0 mi</span>
          <span className="mn text-[11px]" style={{ color: "#555555" }}>
            {formatNumber(maxBusinessMiles)} mi max
          </span>
        </div>
      </div>

      {/* ── Live result tiles ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Mileage deduction */}
        <div
          className="rounded-xl px-4 py-4"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] mb-2" style={{ color: "rgba(59,130,246,0.75)" }}>
            Standard mileage
          </p>
          <p className="mn text-[1.6rem] font-bold text-[#EDEDED] leading-none animate-ticker">
            {formatCurrency(result?.allowedDeductionAmount ?? 0)}
          </p>
          <p className="text-[11px] mt-1.5" style={{ color: "#555555" }}>
            IRS per-mile rate × business miles
          </p>
        </div>

        {/* Tax savings — hero green */}
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
          <p className="mn text-[1.6rem] font-bold leading-none animate-ticker" style={{ color: "#00FF85" }}>
            {formatCurrency(taxSavings)}
          </p>
          <p className="text-[11px] mt-1.5" style={{ color: "#555555" }}>
            At your {(marginalTaxRate * 100).toFixed(0)}% marginal rate — lower tax from the deduction, not a guarantee of refund.
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
