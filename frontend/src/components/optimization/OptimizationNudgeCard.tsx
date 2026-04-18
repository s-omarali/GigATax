import { Car, DollarSign, Gauge, MapPinned } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getOptimizationMileage } from "../../services/mockApi";
import type { OptimizationSignal } from "../../types/domain";
import { formatCurrency, formatNumber, getEstimatedTaxSavings } from "../../utils/taxMath";
import { LoadingState } from "../state/LoadingState";

interface OptimizationNudgeCardProps {
  signal: OptimizationSignal;
  stateCode: string;
  marginalTaxRate: number;
}

interface MileageResult {
  averageGasPrice: number;
  estimatedMiles: number;
  allowedDeductionAmount: number;
}

export function OptimizationNudgeCard({ signal, stateCode, marginalTaxRate }: OptimizationNudgeCardProps) {
  const [selectedState, setSelectedState] = useState(stateCode || "CA");
  const [mpg, setMpg] = useState(24);
  const [businessMiles, setBusinessMiles] = useState(450);
  const [result, setResult] = useState<MileageResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    return () => {
      isMounted = false;
    };
  }, [businessMiles, mpg, selectedState, signal.gasSpend]);

  useEffect(() => {
    if (!result) return;
    if (businessMiles > result.estimatedMiles) {
      setBusinessMiles(Math.max(0, Math.floor(result.estimatedMiles)));
    }
  }, [businessMiles, result]);

  const maxBusinessMiles = useMemo(() => Math.max(1, Math.floor(result?.estimatedMiles ?? 1000)), [result?.estimatedMiles]);
  const taxSavings = useMemo(() => {
    if (!result) return 0;
    return getEstimatedTaxSavings(result.allowedDeductionAmount, marginalTaxRate);
  }, [marginalTaxRate, result]);

  if (isLoading && !result) {
    return <LoadingState title="Optimization Nudge" description="Crunching your mileage deduction estimate..." />;
  }

  return (
    <section className="bento-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-neon-cyan">Tax Savings Optimization</p>
          <h2 className="text-2xl font-bold text-white">Vehicle Mileage Deduction</h2>
        </div>
        <span className="rounded-full bg-neon-mint/15 px-2 py-1 text-xs font-semibold text-neon-mint">{signal.detectedPeriodLabel}</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <span className="mb-2 flex items-center gap-2 text-sm text-slate-300"><MapPinned className="h-4 w-4" />State</span>
          <input
            value={selectedState}
            onChange={(event) => setSelectedState(event.target.value.toUpperCase())}
            maxLength={2}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 uppercase text-white outline-none focus:border-neon-cyan"
          />
        </label>

        <label className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <span className="mb-2 flex items-center gap-2 text-sm text-slate-300"><Gauge className="h-4 w-4" />Vehicle MPG</span>
          <input
            type="number"
            min={5}
            max={70}
            value={mpg}
            onChange={(event) => setMpg(Number(event.target.value) || 0)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-white outline-none focus:border-neon-cyan"
          />
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-200">
        <p className="mb-2 flex items-center gap-2"><Car className="h-4 w-4 text-neon-amber" />We detected {formatCurrency(signal.gasSpend)} in gas spend.</p>
        <p>
          Using {selectedState.toUpperCase()} 2025 regular gas average of {formatCurrency(result?.averageGasPrice ?? 0)}/gal and {mpg} MPG,
          that is approximately <strong>{formatNumber(result?.estimatedMiles ?? 0)} total miles</strong>.
        </p>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-slate-200">How many of these miles were for business?</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={maxBusinessMiles}
            value={Math.min(businessMiles, maxBusinessMiles)}
            onChange={(event) => setBusinessMiles(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700"
          />
          <input
            type="number"
            min={0}
            max={maxBusinessMiles}
            value={businessMiles}
            onChange={(event) => setBusinessMiles(Number(event.target.value) || 0)}
            className="w-28 rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white outline-none focus:border-neon-cyan"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Mileage Deduction</p>
          <p className="text-2xl font-extrabold text-white">{formatCurrency(result?.allowedDeductionAmount ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-neon-mint/30 bg-neon-mint/10 p-4 shadow-glow">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-neon-mint"><DollarSign className="h-3.5 w-3.5" />Tax Savings Claimed</p>
          <p className="text-2xl font-extrabold text-neon-mint">{formatCurrency(taxSavings)}</p>
        </div>
      </div>
    </section>
  );
}
