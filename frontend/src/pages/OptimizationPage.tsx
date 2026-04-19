import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HomeOfficeNudgeCard } from "../components/optimization/HomeOfficeNudgeCard";
import { MealsReviewNudgeCard } from "../components/optimization/MealsReviewNudgeCard";
import { OptimizationNudgeCard } from "../components/optimization/OptimizationNudgeCard";
import { EmptyState } from "../components/state/EmptyState";
import { LoadingState } from "../components/state/LoadingState";
import { useOptimizationReview } from "../context/OptimizationReviewContext";
import { getCurrentUser, getDashboardData } from "../services/api";
import type { DashboardResponse } from "../types/api";
import type { MealReviewItem, UserProfile } from "../types/domain";
import {
  incompleteOptimizationSignals,
  mergeOptimizationCompletion,
} from "../utils/optimizationSignals";

export function OptimizationPage() {
  const { completedIds, dismissedIds, completeSignal, dismissSignal } = useOptimizationReview();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const [dash, profile] = await Promise.all([getDashboardData(), getCurrentUser()]);
      if (!active) return;
      setDashboard(dash);
      setUser(profile);
      setIsLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const mergedSignals = useMemo(
    () =>
      dashboard
        ? mergeOptimizationCompletion(dashboard.optimizationSignals, completedIds, dismissedIds)
        : [],
    [dashboard, completedIds, dismissedIds]
  );

  const toReview = useMemo(
    () => incompleteOptimizationSignals(mergedSignals),
    [mergedSignals]
  );

  const completedSignals = useMemo(
    () => mergedSignals.filter((s) => s.completed && !s.dismissed),
    [mergedSignals]
  );

  function handleMealsReviewComplete(signalId: string, rows: MealReviewItem[]) {
    setDashboard((prev) => {
      if (!prev) return prev;

      const notesByTxnId = new Map(
        rows.map((row) => [
          row.transactionId,
          `Meal substantiation: purpose=${row.businessPurpose ?? ""}; attendees=${row.attendees ?? ""}`,
        ])
      );

      return {
        ...prev,
        transactions: prev.transactions.map((tx) =>
          notesByTxnId.has(tx.id)
            ? { ...tx, notes: notesByTxnId.get(tx.id) }
            : tx
        ),
        optimizationSignals: prev.optimizationSignals.map((signal) =>
          signal.id === signalId ? { ...signal, completed: true } : signal
        ),
      };
    });

    completeSignal(signalId);
  }

  if (isLoading) return <LoadingState title="Optimization" description="Loading opportunities…" />;
  if (!dashboard || !user) {
    return <EmptyState title="Nothing new yet" description="When we spot a deduction opportunity, it'll appear here." />;
  }

  if (mergedSignals.length === 0) {
    return (
      <EmptyState
        title="Nothing new yet"
        description="When we spot a deduction opportunity, it'll appear here."
      />
    );
  }

  const caughtUp = toReview.length === 0;

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(59,130,246,0.85)" }}>
          Deduction opportunities
        </p>
        <h1 className="text-[1.6rem] font-extrabold text-[#EDEDED] leading-tight">
          Turn activity into savings
        </h1>
        <p className="text-[13px] mt-2" style={{ color: "#888888" }}>
          {caughtUp
            ? "You've confirmed each open review. Adjustments stay saved in this session."
            : `${toReview.length} item${toReview.length !== 1 ? "s" : ""} below — adjust inputs and we show the tax impact.`}
        </p>
      </div>

      {caughtUp && (
        <div
          className="rounded-2xl px-5 py-4"
          style={{
            background: "rgba(0,255,133,0.06)",
            border: "1px solid rgba(0,255,133,0.22)",
            boxShadow: "0 0 28px rgba(0,255,133,0.06)",
          }}
        >
          <p className="text-[15px] font-extrabold text-[#EDEDED]">You&apos;re caught up</p>
          <p className="text-[13px] mt-1 leading-snug" style={{ color: "#888888" }}>
            No open optimization reviews. New activity may surface more opportunities.
          </p>
        </div>
      )}

      {toReview.map((sig) => {
        if (sig.type === "vehicle_mileage") {
          return (
            <OptimizationNudgeCard
              key={sig.id}
              signal={sig}
              stateCode={user.state}
              marginalTaxRate={user.estimatedMarginalTaxRate}
              onReviewComplete={() => completeSignal(sig.id)}
              onDismiss={() => dismissSignal(sig.id)}
            />
          );
        }

        if (sig.type === "home_office") {
          return (
            <HomeOfficeNudgeCard
              key={sig.id}
              signal={sig}
              marginalTaxRate={user.estimatedMarginalTaxRate}
              onReviewComplete={() => completeSignal(sig.id)}
              onDismiss={() => dismissSignal(sig.id)}
            />
          );
        }

        return (
          <MealsReviewNudgeCard
            key={sig.id}
            signal={sig}
            onReviewComplete={(rows) => handleMealsReviewComplete(sig.id, rows)}
            onDismiss={() => dismissSignal(sig.id)}
          />
        );
      })}

      {completedSignals.length > 0 && (
        <details
          className="bento-card group"
          style={{ padding: "20px" }}
          open={caughtUp}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-extrabold text-[#EDEDED] [&::-webkit-details-marker]:hidden">
            <span>
              Completed reviews
              <span className="ml-2 mn text-[12px] font-bold" style={{ color: "#888888" }}>
                ({completedSignals.length})
              </span>
            </span>
            <ChevronDown
              className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180"
              style={{ color: "#888888" }}
              aria-hidden
            />
          </summary>
          <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
            {completedSignals.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span className="font-semibold text-[#EDEDED]">{s.label}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#00FF85" }}>
                  Done
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
