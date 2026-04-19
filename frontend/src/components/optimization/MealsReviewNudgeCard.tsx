import { Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import type { MealReviewItem, MealReviewOptimizationSignal } from "../../types/domain";
import { formatCurrency } from "../../utils/taxMath";

interface MealsReviewNudgeCardProps {
  signal: MealReviewOptimizationSignal;
  onReviewComplete?: (rows: MealReviewItem[]) => void;
  onDismiss?: () => void;
}

export function MealsReviewNudgeCard({ signal, onReviewComplete, onDismiss }: MealsReviewNudgeCardProps) {
  const [rows, setRows] = useState<MealReviewItem[]>(signal.meals.map((m) => ({ ...m })));

  function updateRow(transactionId: string, patch: Partial<MealReviewItem>) {
    setRows((prev) => prev.map((row) => (row.transactionId === transactionId ? { ...row, ...patch } : row)));
  }

  const canSubmit = useMemo(
    () => rows.length > 0 && rows.every((r) => r.businessPurpose?.trim() && r.attendees?.trim()),
    [rows]
  );

  return (
    <section className="bento-card" style={{ padding: "24px" }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
          >
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: "rgba(245,158,11,0.9)" }}>
              Substantiation required
            </p>
            <h2 className="text-[16px] font-extrabold text-[#EDEDED] leading-tight">
              Meals over {formatCurrency(signal.threshold)} need review
            </h2>
            <p className="text-[12px] mt-1.5 leading-snug" style={{ color: "#666666" }}>
              Fill in business purpose and attendees for each meal to keep it as a deduction candidate.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <table className="w-full min-w-[760px] text-left text-[12px]">
          <thead style={{ background: "rgba(255,255,255,0.03)" }}>
            <tr>
              <th className="px-3 py-2.5 font-semibold text-[#888888]">Date</th>
              <th className="px-3 py-2.5 font-semibold text-[#888888]">Place</th>
              <th className="px-3 py-2.5 font-semibold text-[#888888]">Amount</th>
              <th className="px-3 py-2.5 font-semibold text-[#888888]">Business purpose</th>
              <th className="px-3 py-2.5 font-semibold text-[#888888]">Who attended</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.transactionId} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <td className="px-3 py-2.5 text-[#EDEDED]">{row.date}</td>
                <td className="px-3 py-2.5 text-[#EDEDED]">{row.merchant}</td>
                <td className="px-3 py-2.5 mn text-[#EDEDED]">{formatCurrency(row.amount)}</td>
                <td className="px-3 py-2.5">
                  <input
                    value={row.businessPurpose ?? ""}
                    onChange={(e) => updateRow(row.transactionId, { businessPurpose: e.target.value })}
                    className="giga-input"
                    placeholder="Client strategy meeting"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    value={row.attendees ?? ""}
                    onChange={(e) => updateRow(row.transactionId, { attendees: e.target.value })}
                    className="giga-input"
                    placeholder="Jane Doe, Acme Media"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onReviewComplete ? (
        <div className="mt-6 border-t border-white/[0.06] pt-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => onReviewComplete(rows)}
              className="w-full rounded-xl px-4 py-3 text-[13px] font-extrabold transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "rgba(0,255,133,0.12)",
                border: "1px solid rgba(0,255,133,0.35)",
                color: "#00FF85",
                boxShadow: "0 0 22px rgba(0,255,133,0.12)",
              }}
            >
              Save meal details and complete review
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
