import { avgGasPriceByState2025 } from "../data/mockData";
import type { OptimizationSignal } from "../types/domain";
import {
  estimateMilesFromGasSpend,
  getAllowedMileageDeduction,
  getAverageGasPriceForState,
  getEstimatedTaxSavings,
} from "./taxMath";

const LS_KEY = "gigatax_optimization_completed_ids";

/**
 * Demo: clears any stored optimization completion IDs. Call once per full page load so a
 * reload always starts with pending reviews again; safe to call manually (e.g. devtools / a reset button).
 */
export function resetOptimizationTasksForDemo(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

/** Merge mock `completed` with user-marked IDs from Optimization tab. */
export function mergeOptimizationCompletion(
  signals: OptimizationSignal[],
  userCompletedIds: ReadonlySet<string>,
  userDismissedIds: ReadonlySet<string>
): OptimizationSignal[] {
  return signals.map((s) => ({
    ...s,
    completed: Boolean(s.completed || userCompletedIds.has(s.id)),
    dismissed: Boolean(s.dismissed || userDismissedIds.has(s.id)),
  }));
}

/** Signals the user still needs to review on Optimization (demo: `completed` flag in mock data). */
export function incompleteOptimizationSignals(signals: OptimizationSignal[]): OptimizationSignal[] {
  return signals.filter((s) => !s.completed && !s.dismissed);
}

export function countIncompleteOptimizationSignals(signals: OptimizationSignal[]): number {
  return incompleteOptimizationSignals(signals).length;
}

export function optimizationReviewLabels(signals: OptimizationSignal[]): string[] {
  return incompleteOptimizationSignals(signals).map((s) => s.label);
}

/** IRS simplified method for demo — same cap as `HomeOfficeNudgeCard`. */
function estimateSimplifiedHomeOfficeDeduction(sqFt: number, businessUsePercent: number): number {
  const share = Math.min(1, Math.max(0, businessUsePercent / 100));
  const eligibleSqFt = sqFt * share;
  const raw = Math.round(eligibleSqFt * 5);
  return Math.min(1500, raw);
}

/**
 * Sum of estimated federal tax savings if each **incomplete** optimization were confirmed at an optimistic demo ceiling:
 * — **Mileage:** all miles inferred from the signal’s gas spend (state gas table, 24 MPG) treated as business, × standard mileage rate × marginal rate.
 * — **Home office:** simplified $5/sq ft × business-use share (capped at $1,500) × marginal rate.
 * Not tax advice; aligns with the same math as `getOptimizationMileage` / home office card defaults.
 */
export function estimatePendingOptimizationTaxSavingsUpperBound(
  incompleteSignals: OptimizationSignal[],
  marginalTaxRate: number,
  stateCode: string
): number {
  const rate = Math.min(0.5, Math.max(0, marginalTaxRate));
  const state = stateCode.trim().toUpperCase().slice(0, 2) || "TX";
  const mpg = 24;

  let sum = 0;
  for (const s of incompleteSignals) {
    if (s.type === "home_office") {
      const deduction = estimateSimplifiedHomeOfficeDeduction(s.workspaceSqFt, s.suggestedBusinessUsePercent);
      sum += getEstimatedTaxSavings(deduction, rate);
    } else if (s.type === "vehicle_mileage") {
      const avgGas = getAverageGasPriceForState(state, avgGasPriceByState2025);
      const inferredMiles = estimateMilesFromGasSpend(s.gasSpend, avgGas, mpg);
      const businessMiles = Math.max(0, Math.floor(inferredMiles));
      const allowed = getAllowedMileageDeduction(businessMiles);
      sum += getEstimatedTaxSavings(allowed, rate);
    } else if (s.type === "meal_review") {
      // Demo assumption: 50% meal deduction eligibility once substantiated.
      const deduction = s.meals.reduce((acc, meal) => acc + meal.amount * 0.5, 0);
      sum += getEstimatedTaxSavings(deduction, rate);
    }
  }
  return Math.round(sum * 100) / 100;
}
