import { Play, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LoadingState } from "../components/state/LoadingState";
import { SuccessState } from "../components/state/SuccessState";
import {
  approveCurrentFilingStep,
  getFilingPreparationDefaults,
  saveFilingPreparation,
  startFilingRun,
} from "../services/mockApi";
import type { FilingProfile, FilingRun } from "../types/domain";

interface ExtendedFilingProfile extends FilingProfile {
  ssn: string;
}

export function FilingPrepPage() {
  const [profile, setProfile] = useState<ExtendedFilingProfile | null>(null);
  const [provider, setProvider] = useState<FilingRun["provider"]>("TurboTax");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [run, setRun] = useState<FilingRun | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const defaults = await getFilingPreparationDefaults();
      if (!active) return;
      setProfile({ ...defaults, ssn: `***-**-${defaults.ssnLast4}` });
      setIsLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const currentStep = useMemo(() => {
    if (!run) return null;
    return run.steps[run.currentStepIndex] ?? null;
  }, [run]);

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    await saveFilingPreparation({ ...profile, ssnLast4: profile.ssn.slice(-4), acceptDisclosure: true });
    setIsSaving(false);
    setSaved(true);
  }

  async function handleStartRun() {
    const started = await startFilingRun({ provider });
    setRun(started);
  }

  async function handleApproveNext() {
    if (!run) return;
    const updated = await approveCurrentFilingStep(run);
    setRun(updated);
  }

  if (isLoading || !profile) return <LoadingState title="Filing prep" description="Crunching…" />;

  const inputStyle = "giga-input";
  const labelStyle = "text-[12px] font-medium block mb-1.5";

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(59,130,246,0.85)" }}>
          Last few things before you&apos;re done
        </p>
        <h1 className="text-[1.65rem] font-extrabold text-[#EDEDED] leading-tight">
          Filing information
        </h1>
        <p className="text-[13px] mt-2" style={{ color: "#888888" }}>
          Encrypted in transit and at rest. We treat tax data like financial data — because it is.
        </p>
      </div>

      <section className="bento-card grid gap-4 sm:grid-cols-2" style={{ padding: "24px" }}>
        <label>
          <span className={labelStyle} style={{ color: "#888888" }}>Legal name</span>
          <input
            value={profile.legalName}
            onChange={(e) => setProfile((p) => p ? { ...p, legalName: e.target.value } : p)}
            className={inputStyle}
          />
        </label>
        <label>
          <span className={labelStyle} style={{ color: "#888888" }}>Social Security Number</span>
          <input
            value={profile.ssn}
            onChange={(e) => setProfile((p) => p ? { ...p, ssn: e.target.value } : p)}
            className={`${inputStyle} mn`}
          />
          <p className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: "#555555" }}>
            🔒 256-bit encrypted · We never store your full SSN
          </p>
        </label>
        <label>
          <span className={labelStyle} style={{ color: "#888888" }}>Dependents</span>
          <input
            type="number"
            min={0}
            value={profile.dependents}
            onChange={(e) => setProfile((p) => p ? { ...p, dependents: Number(e.target.value) } : p)}
            className={`${inputStyle} mn`}
          />
        </label>
        <label>
          <span className={labelStyle} style={{ color: "#888888" }}>Filing status</span>
          <select
            value={profile.filingStatus}
            onChange={(e) => setProfile((p) => p ? { ...p, filingStatus: e.target.value as FilingProfile["filingStatus"] } : p)}
            className={inputStyle}
          >
            <option value="single">Single</option>
            <option value="married_joint">Married filing jointly</option>
            <option value="married_separate">Married filing separately</option>
            <option value="head_household">Head of household</option>
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={labelStyle} style={{ color: "#888888" }}>Address</span>
          <input
            value={profile.address1}
            onChange={(e) => setProfile((p) => p ? { ...p, address1: e.target.value } : p)}
            className={inputStyle}
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-150 disabled:opacity-40"
          style={{ background: "#3B82F6", color: "#ffffff" }}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving…" : "Save"}
        </button>

        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as FilingRun["provider"])}
          className="rounded-xl px-3 py-2.5 text-[13px] outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#EDEDED",
          }}
        >
          <option value="TurboTax">TurboTax</option>
          <option value="FreeTaxUSA">FreeTaxUSA</option>
        </select>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl"
          style={{ background: "rgba(0,255,133,0.2)", transform: "scale(1.02)" }}
        />
        <button
          type="button"
          onClick={() => void handleStartRun()}
          className="relative w-full flex items-center justify-center gap-3 rounded-2xl py-5 text-[16px] font-extrabold tracking-tight transition-all duration-150 active:scale-[0.99] hover:brightness-110"
          style={{
            background: "#00FF85",
            color: "#0a0a0f",
            boxShadow: "0 0 48px rgba(0,255,133,0.35), 0 10px 28px rgba(0,0,0,0.55)",
          }}
        >
          <Play className="h-5 w-5" />
          File Taxes — start session
        </button>
      </div>

      {saved && (
        <SuccessState
          title="Nice. Saved."
          description="When you're ready, start the filing session below — we'll walk each step with you."
        />
      )}

      {run && (
        <section className="bento-card space-y-5" style={{ padding: "24px" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(59,130,246,0.85)" }}>
                What happens next
              </p>
              <h2 className="text-[16px] font-extrabold text-[#EDEDED]">Filing steps — {provider}</h2>
            </div>
            <span
              className="chip"
              style={{ background: "rgba(255,255,255,0.06)", color: "#888888" }}
            >
              {run.status === "awaiting_user"
                ? "Waiting on you"
                : run.status === "completed"
                ? "Done"
                : run.status === "running"
                ? "Running"
                : "Ready"}
            </span>
          </div>

          {currentStep && (
            <div
              className="rounded-xl px-4 py-4 space-y-2"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-[13px] font-semibold text-[#EDEDED] mb-3">
                Up next: {currentStep.label}
              </p>
              {currentStep.preview.map((item) => (
                <div key={item.field} className="flex justify-between text-[13px]">
                  <span style={{ color: "#888888" }}>{item.field}</span>
                  <span className="font-medium text-[#EDEDED]">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {run.status !== "completed" ? (
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl blur-2xl"
                style={{ background: "rgba(59,130,246,0.18)", transform: "scale(1.02)" }}
              />
              <button
                type="button"
                onClick={() => void handleApproveNext()}
                className="relative w-full rounded-2xl py-4 text-[15px] font-extrabold transition-all duration-150 active:scale-[0.99]"
                style={{
                  background: "#3B82F6",
                  color: "#ffffff",
                  boxShadow: "0 0 40px rgba(59,130,246,0.35), 0 10px 26px rgba(0,0,0,0.45)",
                }}
              >
                Lock it in ✓ — next step
              </button>
            </div>
          ) : (
            <SuccessState title="All set." description="All filing steps are approved. We'll notify you if anything changes." />
          )}
        </section>
      )}
    </div>
  );
}
