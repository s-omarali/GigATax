import { Bot, TrendingDown, TrendingUp } from "lucide-react";
import type { Transaction } from "../../types/domain";
import { formatCurrency } from "../../utils/taxMath";

interface CategorizationFeedProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  Income:      { text: "#00FF85", bg: "rgba(0,255,133,0.1)" },
  Software:    { text: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  Travel:      { text: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  Vehicle:     { text: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  Meals:       { text: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  Supplies:    { text: "#888888", bg: "rgba(255,255,255,0.05)" },
  "Home Office":{ text: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  Uncategorized:{ text: "#555555", bg: "rgba(255,255,255,0.04)" },
};

const SOURCE_LABELS: Record<string, string> = {
  bank:    "Bank sync",
  email:   "Email receipt",
  receipt: "OCR scan",
};

export function CategorizationFeed({ transactions }: CategorizationFeedProps) {
  return (
    <section className="bento-card flex flex-col" style={{ padding: "20px 20px" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
          >
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold text-[#EDEDED]">AI Activity Feed</h2>
            <p className="text-[11px] text-[#555555]">Auto-classified in background</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="neon-dot" />
          <span className="text-[11px] font-medium" style={{ color: "#00FF85" }}>Live</span>
        </div>
      </div>

      {/* Feed rows */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {transactions.map((txn) => {
          const cat = CATEGORY_COLORS[txn.category] ?? CATEGORY_COLORS.Uncategorized;
          const isIncome = txn.type === "income";

          return (
            <div
              key={txn.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)")}
            >
              {/* Icon */}
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: isIncome ? "rgba(0,255,133,0.08)" : "rgba(255,255,255,0.04)" }}
              >
                {isIncome
                  ? <TrendingUp className="h-3.5 w-3.5" style={{ color: "#00FF85" }} />
                  : <TrendingDown className="h-3.5 w-3.5" style={{ color: "#888888" }} />
                }
              </div>

              {/* Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-medium text-[#EDEDED] truncate">
                    {txn.merchant}
                  </p>
                  {/* AI auto-tag */}
                  <span
                    className="chip flex-shrink-0"
                    style={{ background: cat.bg, color: cat.text }}
                  >
                    {txn.category}
                  </span>
                </div>
                <p className="text-[11px] text-[#555555]">
                  {txn.date} · {SOURCE_LABELS[txn.source] ?? txn.source} · {Math.round(txn.confidenceScore * 100)}% confidence
                </p>
              </div>

              {/* Amount */}
              <p
                className="mn flex-shrink-0 text-[13px] font-semibold"
                style={{ color: isIncome ? "#00FF85" : "#EDEDED" }}
              >
                {isIncome ? "+" : "−"}{formatCurrency(txn.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
