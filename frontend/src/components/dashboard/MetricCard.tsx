import type { ReactNode } from "react";

type AccentColor = "green" | "blue" | "amber" | "red";

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  accent?: AccentColor;
  /** Renders value in the large hero style (full-width savings counter) */
  hero?: boolean;
}

const ACCENT: Record<AccentColor, {
  iconBg:    string;
  iconColor: string;
  valueCss:  string;
  badgeBg:   string;
  badgeText: string;
  glow:      string;
}> = {
  green: {
    iconBg:    "rgba(0,255,133,0.1)",
    iconColor: "#00FF85",
    valueCss:  "#00FF85",
    badgeBg:   "rgba(0,255,133,0.1)",
    badgeText: "#00FF85",
    glow:      "0 0 0 1px rgba(0,255,133,0.25), 0 0 48px rgba(0,255,133,0.12)",
  },
  blue: {
    iconBg:    "rgba(59,130,246,0.1)",
    iconColor: "#3B82F6",
    valueCss:  "#EDEDED",
    badgeBg:   "rgba(59,130,246,0.1)",
    badgeText: "#3B82F6",
    glow:      "0 0 0 1px rgba(59,130,246,0.2), 0 0 40px rgba(59,130,246,0.1)",
  },
  amber: {
    iconBg:    "rgba(245,158,11,0.1)",
    iconColor: "#F59E0B",
    valueCss:  "#EDEDED",
    badgeBg:   "rgba(245,158,11,0.1)",
    badgeText: "#F59E0B",
    glow:      "0 0 0 1px rgba(245,158,11,0.2), 0 0 40px rgba(245,158,11,0.08)",
  },
  red: {
    iconBg:    "rgba(239,68,68,0.1)",
    iconColor: "#EF4444",
    valueCss:  "#EDEDED",
    badgeBg:   "rgba(239,68,68,0.1)",
    badgeText: "#EF4444",
    glow:      "0 0 0 1px rgba(239,68,68,0.2), 0 0 32px rgba(239,68,68,0.08)",
  },
};

export function MetricCard({
  label,
  value,
  subtext,
  icon,
  accent = "blue",
  hero = false,
}: MetricCardProps) {
  const a = ACCENT[accent];

  if (hero) {
    return (
      <div
        className="bento-card relative overflow-hidden"
        style={{ boxShadow: a.glow, padding: "32px 28px" }}
      >
        {/* Glow blob behind the number */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="h-56 w-56 rounded-full blur-[80px] opacity-20"
            style={{ background: a.valueCss }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            {icon && (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: a.iconBg, color: a.iconColor }}
              >
                {icon}
              </div>
            )}
            <p
              className="text-[11px] font-semibold tracking-[0.1em] uppercase"
              style={{ color: a.iconColor }}
            >
              {label}
            </p>
          </div>

          <p
            className="mn text-[3.25rem] font-bold leading-none tracking-tight"
            style={{ color: a.valueCss }}
          >
            {value}
          </p>

          {subtext && (
            <p className="mt-3 text-[13px]" style={{ color: "#888888" }}>
              {subtext}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bento-card" style={{ padding: "22px 22px" }}>
      <div className="flex items-start justify-between mb-5">
        {icon && (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: a.iconBg, color: a.iconColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <p
        className="mn text-[1.7rem] font-bold leading-none tracking-tight mb-1"
        style={{ color: a.valueCss }}
      >
        {value}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-2" style={{ color: a.iconColor }}>
        {label}
      </p>
      {subtext && (
        <p className="text-[12px] leading-snug" style={{ color: "#888888" }}>
          {subtext}
        </p>
      )}
    </div>
  );
}
