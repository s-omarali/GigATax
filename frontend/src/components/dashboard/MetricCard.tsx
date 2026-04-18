import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon?: ReactNode;
  accent?: "cyan" | "mint" | "amber";
}

const accentClasses: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  cyan: "from-neon-cyan/20",
  mint: "from-neon-mint/20",
  amber: "from-neon-amber/20",
};

export function MetricCard({ label, value, subtext, icon, accent = "cyan" }: MetricCardProps) {
  return (
    <div className={`bento-card bg-gradient-to-br ${accentClasses[accent]} to-transparent p-5`}> 
      <div className="mb-4 flex items-center justify-between text-slate-300">
        <span className="text-xs uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{subtext}</p>
    </div>
  );
}
