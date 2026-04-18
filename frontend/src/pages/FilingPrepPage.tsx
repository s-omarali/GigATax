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

    return () => {
      active = false;
    };
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

  if (isLoading || !profile) {
    return <LoadingState title="Filing Prep" description="Loading your filing profile fields..." />;
  }

  return (
    <div className="space-y-4 animate-rise">
      <header className="bento-card p-5">
        <p className="text-xs uppercase tracking-wider text-neon-cyan">Prepare Numbers for Auto Filing</p>
        <h1 className="text-3xl font-black text-white">Complete Missing Filing Information</h1>
      </header>

      <section className="bento-card grid gap-3 p-5 md:grid-cols-2">
        <label className="space-y-1 text-sm text-slate-300">
          Legal Name
          <input
            value={profile.legalName}
            onChange={(event) => setProfile((prev) => (prev ? { ...prev, legalName: event.target.value } : prev))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          SSN
          <input
            value={profile.ssn}
            onChange={(event) => setProfile((prev) => (prev ? { ...prev, ssn: event.target.value } : prev))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          Dependents
          <input
            type="number"
            min={0}
            value={profile.dependents}
            onChange={(event) => setProfile((prev) => (prev ? { ...prev, dependents: Number(event.target.value) } : prev))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-300">
          Filing Status
          <select
            value={profile.filingStatus}
            onChange={(event) => setProfile((prev) => (prev ? { ...prev, filingStatus: event.target.value as FilingProfile["filingStatus"] } : prev))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
          >
            <option value="single">Single</option>
            <option value="married_joint">Married filing jointly</option>
            <option value="married_separate">Married filing separately</option>
            <option value="head_household">Head of household</option>
          </select>
        </label>
        <label className="space-y-1 text-sm text-slate-300 md:col-span-2">
          Address
          <input
            value={profile.address1}
            onChange={(event) => setProfile((prev) => (prev ? { ...prev, address1: event.target.value } : prev))}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 text-sm font-semibold text-ink-950 disabled:bg-slate-700 disabled:text-slate-400"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Filing Profile"}
        </button>

        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as FilingRun["provider"])}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-neon-cyan"
        >
          <option value="TurboTax">TurboTax</option>
          <option value="FreeTaxUSA">FreeTaxUSA</option>
        </select>

        <button
          onClick={() => void handleStartRun()}
          className="inline-flex items-center gap-2 rounded-lg bg-neon-mint/20 px-4 py-2 text-sm font-semibold text-neon-mint"
        >
          <Play className="h-4 w-4" />
          Start Filing Session
        </button>
      </div>

      {saved && <SuccessState title="Filing profile saved" description="Your inputs are stored and ready for filing orchestration." />}

      {run && (
        <section className="bento-card space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neon-cyan">Orchestration Preview</p>
              <h2 className="text-xl font-bold text-white">{provider} Guided Submission</h2>
            </div>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{run.status}</span>
          </div>

          {currentStep && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-2 text-sm font-semibold text-slate-100">Current Step: {currentStep.label}</p>
              <div className="space-y-2 text-sm text-slate-300">
                {currentStep.preview.map((item) => (
                  <p key={item.field}>
                    {item.field}: <span className="font-medium text-white">{item.value}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {run.status !== "completed" ? (
            <button onClick={() => void handleApproveNext()} className="rounded-lg bg-neon-cyan px-4 py-2 text-sm font-semibold text-ink-950">
              Accept and Next
            </button>
          ) : (
            <SuccessState title="Automation complete" description="All filing steps were approved and completed successfully." />
          )}
        </section>
      )}
    </div>
  );
}
