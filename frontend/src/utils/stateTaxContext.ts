/**
 * Demo heuristic only — not tax advice.
 * Toy multipliers so CA/NY/TX read differently in the UI; default bucket for other states.
 */
export interface StateTaxContext {
  /** Uppercase 2-letter code echoed for display. */
  label: string;
  /** Scales demo estimated tax liability (and lightly, deductions found). */
  liabilityMultiplier: number;
  /** Short line for dashboard / headers. */
  note: string;
}

/* Demo heuristic only — not tax advice. */
const STATE_OVERRIDES: Record<string, { liabilityMultiplier: number; note: string }> = {
  CA: { liabilityMultiplier: 1.18, note: "Higher combined burden in this demo model." },
  NY: { liabilityMultiplier: 1.14, note: "Northeast stack — heavier liability in this toy blend." },
  NJ: { liabilityMultiplier: 1.1, note: "Higher liability multiplier for demo contrast." },
  TX: { liabilityMultiplier: 0.88, note: "No state income tax in this demo — liability skews lower." },
  FL: { liabilityMultiplier: 0.85, note: "No state income tax placeholder — demo only." },
  WA: { liabilityMultiplier: 0.92, note: "No personal income tax in this heuristic; other factors apply." },
  IL: { liabilityMultiplier: 1.02, note: "Flat state layer in this toy model." },
  PA: { liabilityMultiplier: 1.04, note: "Mid-Atlantic blend in the demo." },
};

const DEFAULT_CONTEXT = {
  liabilityMultiplier: 1,
  note: "Blended US average for the demo.",
};

export function getStateTaxContext(stateCode: string): StateTaxContext {
  const label = stateCode.trim().toUpperCase().slice(0, 2) || "US";
  const row = STATE_OVERRIDES[label] ?? DEFAULT_CONTEXT;
  return {
    label,
    liabilityMultiplier: row.liabilityMultiplier,
    note: STATE_OVERRIDES[label]?.note ?? DEFAULT_CONTEXT.note,
  };
}
