import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionRequiredCardProps {
  pendingCount: number;
}

export function ActionRequiredCard({ pendingCount }: ActionRequiredCardProps) {
  return (
    <section className="bento-card border-neon-coral/50 bg-neon-coral/10 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-neon-coral/20 px-2 py-1 text-xs font-semibold uppercase text-neon-coral">
            <AlertTriangle className="h-3.5 w-3.5" />
            Action Required
          </p>
          <h2 className="text-xl font-bold text-white">Optimization Checklist Needs Attention</h2>
          <p className="mt-2 text-sm text-slate-200">
            You have {pendingCount} deduction opportunities that still need your confirmation.
          </p>
        </div>
        <Link
          to="/optimization"
          className="inline-flex items-center gap-2 rounded-lg border border-neon-coral/60 bg-neon-coral/20 px-3 py-2 text-sm font-semibold text-white"
        >
          Complete now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
