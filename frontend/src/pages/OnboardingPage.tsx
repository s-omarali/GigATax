import { CheckCircle2, Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { gigOptions } from "../data/mockData";
import { getIntegrationDefaults, saveOnboarding } from "../services/mockApi";
import type { IntegrationConnection, UserProfile } from "../types/domain";
import { EmptyState } from "../components/state/EmptyState";
import { LoadingState } from "../components/state/LoadingState";
import { SuccessState } from "../components/state/SuccessState";

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [jobSearch, setJobSearch] = useState("");
  const [selectedGigs, setSelectedGigs] = useState<UserProfile["gigs"]>([]);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      const defaults = await getIntegrationDefaults();
      if (!active) return;
      setIntegrations(defaults);
      setIsLoading(false);
    }
    void load();

    return () => {
      active = false;
    };
  }, []);

  const filteredGigs = useMemo(
    () => gigOptions.filter((gig) => gig.toLowerCase().includes(jobSearch.toLowerCase())),
    [jobSearch]
  );

  function toggleGig(gig: UserProfile["gigs"][number]) {
    setSelectedGigs((prev) => (prev.includes(gig) ? prev.filter((g) => g !== gig) : [...prev, gig]));
  }

  function toggleIntegration(id: IntegrationConnection["id"]) {
    setIntegrations((prev) => prev.map((integration) => (integration.id === id ? { ...integration, connected: !integration.connected } : integration)));
  }

  async function handleSubmit() {
    setIsSaving(true);
    await saveOnboarding({ gigs: selectedGigs, integrations });
    setIsSaving(false);
    setIsDone(true);
  }

  if (isLoading) {
    return <LoadingState title="Onboarding" description="Preparing your connection hub..." />;
  }

  if (isDone) {
    return <SuccessState title="Onboarding complete" description="Your gig profile and integrations are ready. Head to Dashboard for optimization insights." />;
  }

  return (
    <div className="space-y-4 animate-rise">
      <header className="bento-card p-5">
        <p className="text-xs uppercase tracking-wider text-neon-cyan">Connection Hub</p>
        <h1 className="text-3xl font-black text-white">Set Up GigATax in 2 Steps</h1>
      </header>

      <div className="bento-card p-5">
        <div className="mb-4 flex items-center gap-3 text-sm text-slate-300">
          <span className={`rounded-full px-3 py-1 ${step === 1 ? "bg-neon-cyan/20 text-neon-cyan" : "bg-slate-800"}`}>1. Job Selection</span>
          <span className={`rounded-full px-3 py-1 ${step === 2 ? "bg-neon-cyan/20 text-neon-cyan" : "bg-slate-800"}`}>2. Integrations</span>
        </div>

        {step === 1 ? (
          <section className="space-y-3">
            <label className="text-sm text-slate-300">Search gig types</label>
            <input
              value={jobSearch}
              onChange={(event) => setJobSearch(event.target.value)}
              placeholder="Search jobs (creator, editor, streamer...)"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
            />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGigs.map((gig) => (
                <button
                  key={gig}
                  onClick={() => toggleGig(gig)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedGigs.includes(gig)
                      ? "border-neon-mint bg-neon-mint/15 text-neon-mint"
                      : "border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-600"
                  }`}
                >
                  {gig}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedGigs.length === 0}
              className="rounded-lg bg-neon-cyan px-4 py-2 font-semibold text-ink-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              Continue
            </button>
          </section>
        ) : (
          <section className="space-y-3">
            {integrations.length === 0 ? (
              <EmptyState title="No integrations configured" description="Add integration providers to continue onboarding." />
            ) : (
              integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <div>
                    <p className="font-semibold text-white">{integration.name}</p>
                    <p className="text-xs text-slate-400">{integration.connected ? "Connected" : "Not connected"}</p>
                  </div>
                  <button
                    onClick={() => toggleIntegration(integration.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                      integration.connected
                        ? "bg-neon-mint/20 text-neon-mint"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    <Link2 className="h-4 w-4" />
                    {integration.connected ? "Connected" : "Connect"}
                  </button>
                </div>
              ))
            )}
            <button
              onClick={() => void handleSubmit()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 font-semibold text-ink-950"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSaving ? "Saving..." : "Complete Onboarding"}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
