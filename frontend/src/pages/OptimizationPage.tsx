import { useEffect, useState } from "react";
import { OptimizationNudgeCard } from "../components/optimization/OptimizationNudgeCard";
import { EmptyState } from "../components/state/EmptyState";
import { LoadingState } from "../components/state/LoadingState";
import { getCurrentUser, getDashboardData } from "../services/mockApi";
import type { OptimizationSignal, UserProfile } from "../types/domain";

export function OptimizationPage() {
  const [signal, setSignal] = useState<OptimizationSignal | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const [dashboard, profile] = await Promise.all([getDashboardData(), getCurrentUser()]);
      if (!active) return;
      setSignal(dashboard.optimizationSignals[0] ?? null);
      setUser(profile);
      setIsLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  if (isLoading) return <LoadingState title="Optimization" description="Generating deduction checklist from your activity..." />;
  if (!signal || !user) return <EmptyState title="No optimization signals" description="Once new patterns are detected, deduction nudges appear here." />;

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(59,130,246,0.8)" }}>
          Optimization Checklist
        </p>
        <h1 className="text-[1.6rem] font-bold text-[#EDEDED] leading-tight">
          Turn Activity Into Tax Savings
        </h1>
      </div>
      <OptimizationNudgeCard
        signal={signal}
        stateCode={user.state}
        marginalTaxRate={user.estimatedMarginalTaxRate}
      />
    </div>
  );
}
