import { Bot, Check, MoreHorizontal, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Transaction, TransactionCategory } from "../../types/domain";
import { formatCurrency } from "../../utils/taxMath";

interface CategorizationFeedProps {
  transactions: Transaction[];
  onUpdateTransaction?: (id: string, patch: Partial<Transaction>) => void;
  onRemoveTransaction?: (id: string) => void;
}

const ALL_CATEGORIES: TransactionCategory[] = [
  "Income",
  "Software",
  "Travel",
  "Meals",
  "Vehicle",
  "Home Office",
  "Supplies",
  "Uncategorized",
];

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  Income:        { text: "#00FF85", bg: "rgba(0,255,133,0.1)" },
  Software:      { text: "#3B82F6", bg: "rgba(59,130,246,0.1)" },
  Travel:        { text: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  Vehicle:       { text: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  Meals:         { text: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  Supplies:      { text: "#888888", bg: "rgba(255,255,255,0.05)" },
  "Home Office": { text: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  Uncategorized: { text: "#555555", bg: "rgba(255,255,255,0.04)" },
};

const SOURCE_LABELS: Record<string, string> = {
  bank:    "Bank sync",
  email:   "Email receipt",
  receipt: "OCR scan",
};

type RemoveStep = "idle" | "confirm1" | "confirm2";

interface TxnMenuState {
  txnId: string;
  mode: "menu" | "category" | RemoveStep;
}

export function CategorizationFeed({
  transactions,
  onUpdateTransaction,
  onRemoveTransaction,
}: CategorizationFeedProps) {
  const [menu, setMenu] = useState<TxnMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    }
    if (menu) document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menu]);

  function openMenu(txnId: string) {
    setMenu((prev) => (prev?.txnId === txnId && prev.mode === "menu" ? null : { txnId, mode: "menu" }));
  }

  function startCategoryChange(txnId: string) {
    setMenu({ txnId, mode: "category" });
  }

  function selectCategory(txnId: string, cat: TransactionCategory) {
    onUpdateTransaction?.(txnId, { category: cat });
    setMenu(null);
  }

  function startRemove(txnId: string) {
    setMenu({ txnId, mode: "confirm1" });
  }

  function advanceRemove(txnId: string) {
    setMenu({ txnId, mode: "confirm2" });
  }

  function confirmRemove(txnId: string) {
    onRemoveTransaction?.(txnId);
    setMenu(null);
  }

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
            <h2 className="text-[13px] font-extrabold text-[#EDEDED]">Transactions</h2>
            <p className="text-[11px] text-[#666666] leading-snug">
              Auto-categorized. Edit anything that looks off.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="neon-dot" />
          <span className="text-[11px] font-medium" style={{ color: "#00FF85" }}>Live</span>
        </div>
      </div>

      {/* Feed rows */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {transactions.map((txn, idx) => {
          const cat = CATEGORY_COLORS[txn.category] ?? CATEGORY_COLORS.Uncategorized;
          const isIncome = txn.type === "income";
          const isMenuOpen = menu?.txnId === txn.id;

          return (
            <div key={txn.id} className="relative">
              <div
                className="animate-loot-card flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                style={{
                  animationDelay: `${idx * 55}ms`,
                  background: isMenuOpen ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: isMenuOpen
                    ? "1px solid rgba(255,255,255,0.10)"
                    : "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={(e) => {
                  if (!isMenuOpen)
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (!isMenuOpen)
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)";
                }}
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

                {/* Three-dot trigger */}
                <button
                  onClick={(e) => { e.stopPropagation(); openMenu(txn.id); }}
                  className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
                  style={{
                    background: isMenuOpen ? "rgba(255,255,255,0.1)" : "transparent",
                    color: isMenuOpen ? "#EDEDED" : "#555555",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#EDEDED";
                  }}
                  onMouseLeave={(e) => {
                    if (!isMenuOpen) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "#555555";
                    }
                  }}
                  aria-label="Transaction options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Dropdown panel */}
              {isMenuOpen && (
                <div
                  ref={menuRef}
                  className="absolute right-0 z-50 mt-1 rounded-xl overflow-hidden"
                  style={{
                    minWidth: "210px",
                    background: "#1A1A1A",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* ── Main menu ── */}
                  {menu?.mode === "menu" && (
                    <>
                      <MenuButton
                        label="Change category"
                        onClick={() => startCategoryChange(txn.id)}
                      />
                      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                      <MenuButton
                        label="Remove transaction"
                        onClick={() => startRemove(txn.id)}
                        danger
                        icon={<Trash2 className="h-3.5 w-3.5" />}
                      />
                    </>
                  )}

                  {/* ── Category picker ── */}
                  {menu?.mode === "category" && (
                    <>
                      <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                          Change category
                        </p>
                        <button
                          onClick={() => setMenu(null)}
                          className="flex h-5 w-5 items-center justify-center rounded"
                          style={{ color: "#555555" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#EDEDED")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#555555")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {ALL_CATEGORIES.map((c) => {
                        const cc = CATEGORY_COLORS[c] ?? CATEGORY_COLORS.Uncategorized;
                        const isCurrent = c === txn.category;
                        return (
                          <button
                            key={c}
                            onClick={() => selectCategory(txn.id, c)}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors"
                            style={{ color: isCurrent ? cc.text : "#AAAAAA" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2 w-2 rounded-full flex-shrink-0"
                                style={{ background: cc.text }}
                              />
                              <span className="text-[13px] font-medium">{c}</span>
                            </div>
                            {isCurrent && <Check className="h-3.5 w-3.5" style={{ color: cc.text }} />}
                          </button>
                        );
                      })}
                      <div className="pb-1" />
                    </>
                  )}

                  {/* ── Remove: step 1 ── */}
                  {menu?.mode === "confirm1" && (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(239,68,68,0.1)" }}
                        >
                          <Trash2 className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
                        </div>
                        <p className="text-[13px] font-semibold text-[#EDEDED]">Remove transaction?</p>
                      </div>
                      <p className="text-[12px] mb-4" style={{ color: "#888888" }}>
                        <span className="font-medium" style={{ color: "#EDEDED" }}>{txn.merchant}</span> ({formatCurrency(txn.amount)}) will be excluded from your tax summary.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMenu(null)}
                          className="flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-colors"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#888888" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => advanceRemove(txn.id)}
                          className="flex-1 rounded-lg py-1.5 text-[12px] font-semibold transition-colors"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.25)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)")}
                        >
                          Yes, continue
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Remove: step 2 ── */}
                  {menu?.mode === "confirm2" && (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(239,68,68,0.18)" }}
                        >
                          <Trash2 className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
                        </div>
                        <p className="text-[13px] font-semibold" style={{ color: "#EF4444" }}>
                          Final confirmation
                        </p>
                      </div>
                      <p className="text-[12px] mb-4" style={{ color: "#888888" }}>
                        This action cannot be undone. The transaction will be permanently removed from your records.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMenu(null)}
                          className="flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-colors"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#888888" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                        >
                          Keep it
                        </button>
                        <button
                          onClick={() => confirmRemove(txn.id)}
                          className="flex-1 rounded-lg py-1.5 text-[12px] font-bold transition-colors"
                          style={{ background: "#EF4444", color: "#ffffff" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#DC2626")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#EF4444")}
                        >
                          Delete permanently
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Small helper ── */
function MenuButton({
  label,
  onClick,
  danger,
  icon,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium transition-colors"
      style={{ color: danger ? "#EF4444" : "#CCCCCC" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = danger
          ? "rgba(239,68,68,0.08)"
          : "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
