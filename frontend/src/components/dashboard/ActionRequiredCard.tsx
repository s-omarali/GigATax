import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionRequiredCardProps {
  pendingCount: number;
}

export function ActionRequiredCard({ pendingCount }: ActionRequiredCardProps) {
  return (
    <section
      className="bento-card"
      style={{
        padding: "20px",
        border: "1px solid rgba(245,158,11,0.3)",
        boxShadow: "0 0 0 1px rgba(245,158,11,0.1), 0 8px 32px rgba(0,0,0,0.7), 0 0 40px rgba(245,158,11,0.06)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Tag */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <span
              className="chip"
              style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}
            >
              Action Required
            </span>
          </div>

          <h2 className="text-[15px] font-semibold text-[#EDEDED] mb-1 leading-snug">
            {pendingCount} deduction{pendingCount !== 1 ? "s" : ""} need your input
          </h2>
          <p className="text-[12px] text-[#888888] leading-relaxed">
            Confirm or adjust before we calculate your final liability.
          </p>
        </div>

        <Link
          to="/optimization"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all duration-150"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#F59E0B",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(245,158,11,0.18)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(245,158,11,0.1)";
          }}
        >
          Review
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
