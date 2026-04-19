import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  Music,
  Pencil,
  Radio,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { gigOptions } from "../data/mockData";
import {
  createPlaidLinkToken,
  exchangePlaidPublicToken,
  getIntegrationDefaults,
  saveOnboarding,
  syncAllPlaidTransactions,
} from "../services/mockApi";
import type { IntegrationConnection, UserProfile } from "../types/domain";

// ── Icon map ──────────────────────────────────────────────────────────────
const GIG_ICONS: Record<string, React.ReactNode> = {
  "Content Creator":  <Video className="h-4 w-4" />,
  "Video Editor":     <Sparkles className="h-4 w-4" />,
  "Streamer":         <Radio className="h-4 w-4" />,
  "Photographer":     <Pencil className="h-4 w-4" />,
  "Podcaster":        <Music className="h-4 w-4" />,
  "Freelance Writer": <Pencil className="h-4 w-4" />,
};

// ── 3 user-action steps; step 4 is confirmation only (not counted) ────────
const STEPS = [
  { number: 1, label: "Your Work" },
  { number: 2, label: "Connect" },
  { number: 3, label: "1099s" },
];

// ── 1099 file record ──────────────────────────────────────────────────────
interface Form1099 {
  id: string;
  name: string;
  size: number;
  /** "pending" while fake-uploading, "done" once complete */
  status: "pending" | "done";
  /** Mocked parse result */
  payer?: string;
  income?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Fake parsers for demo realism
const MOCK_PAYERS = ["YouTube LLC", "Patreon Inc.", "Twitch Interactive", "Substack", "Spotify AB", "TikTok Ltd."];
function mockParse(filename: string): { payer: string; income: number } {
  const seed = filename.charCodeAt(0) % MOCK_PAYERS.length;
  return {
    payer: MOCK_PAYERS[seed],
    income: Math.round((seed + 1) * 3271.5 + filename.length * 47.3),
  };
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [jobSearch, setJobSearch] = useState("");
  const [selectedGigs, setSelectedGigs] = useState<UserProfile["gigs"]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Step 2
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [plaidLinkToken, setPlaidLinkToken] = useState<string | null>(null);
  const [isPlaidConnecting, setIsPlaidConnecting] = useState(false);

  // Step 3 — 1099 uploads
  const [forms, setForms] = useState<Form1099[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const defaults = await getIntegrationDefaults();
      if (!active) return;
      setIntegrations(defaults);
      setIsLoading(false);
    }
    void load();
    return () => { active = false; };
  }, []);

  const filteredGigs = useMemo(
    () => gigOptions.filter((g) => g.toLowerCase().includes(jobSearch.toLowerCase())),
    [jobSearch]
  );

  function toggleGig(gig: UserProfile["gigs"][number]) {
    setSelectedGigs((prev) =>
      prev.includes(gig) ? prev.filter((g) => g !== gig) : [...prev, gig]
    );
  }

  function toggleIntegration(id: IntegrationConnection["id"]) {
    setIntegrations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i))
    );
  }

  const onPlaidSuccess = useCallback(async (publicToken: string) => {
    await exchangePlaidPublicToken({ public_token: publicToken });
    await syncAllPlaidTransactions();

    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === "bank"
          ? { ...integration, connected: true, lastSyncAt: new Date().toISOString() }
          : integration
      )
    );

    setIsPlaidConnecting(false);
    setPlaidLinkToken(null);
  }, []);

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: plaidLinkToken,
    onSuccess: (publicToken) => {
      void onPlaidSuccess(publicToken);
    },
    onExit: () => {
      setIsPlaidConnecting(false);
    },
  });

  useEffect(() => {
    if (!plaidLinkToken || !plaidReady || !isPlaidConnecting) return;
    openPlaid();
  }, [isPlaidConnecting, openPlaid, plaidLinkToken, plaidReady]);

  async function handleIntegrationConnect(integration: IntegrationConnection) {
    if (integration.id !== "bank") {
      toggleIntegration(integration.id);
      return;
    }

    if (integration.connected) {
      toggleIntegration(integration.id);
      return;
    }

    try {
      setIsPlaidConnecting(true);
      const tokenResponse = await createPlaidLinkToken();
      setPlaidLinkToken(tokenResponse.link_token);
    } catch {
      setIsPlaidConnecting(false);
    }
  }

  // ── 1099 upload logic ─────────────────────────────────────────────────
  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const incoming: Form1099[] = Array.from(fileList).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      status: "pending" as const,
    }));
    setForms((prev) => [...prev, ...incoming]);

    // Simulate OCR parsing with a short delay per file
    incoming.forEach((form, i) => {
      setTimeout(() => {
        const parsed = mockParse(form.name);
        setForms((prev) =>
          prev.map((f) =>
            f.id === form.id
              ? { ...f, status: "done", payer: parsed.payer, income: parsed.income }
              : f
          )
        );
      }, 900 + i * 400);
    });
  }, []);

  function removeForm(id: string) {
    setForms((prev) => prev.filter((f) => f.id !== id));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function handleFinish() {
    setIsSaving(true);
    await saveOnboarding({ gigs: selectedGigs, integrations });
    setIsSaving(false);
    setStep(4);
  }

  const totalDetectedIncome = forms
    .filter((f) => f.status === "done" && f.income)
    .reduce((sum, f) => sum + (f.income ?? 0), 0);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#050505", color: "#EDEDED" }}
    >
      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[180px]"
          style={{ background: "rgba(0,255,133,0.06)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-[160px]"
          style={{ background: "rgba(59,130,246,0.07)" }}
        />
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "#00FF85", boxShadow: "0 0 16px rgba(0,255,133,0.4)" }}
          >
            <Zap className="h-4 w-4" style={{ color: "#050505" }} fill="currentColor" />
          </div>
          <span className="text-[15px] font-bold text-[#EDEDED] tracking-tight">GigATax</span>
        </div>

        {/* Step progress bar — 3 pills for 3 action steps */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === s.number ? "28px" : "10px",
                background: step > s.number
                  ? "#00FF85"
                  : step === s.number
                  ? "#3B82F6"
                  : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
          {step <= 3 && (
            <span className="ml-2 text-[11px] font-medium" style={{ color: "#555555" }}>
              {step} / 3
            </span>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[560px]">

          {/* ══════════════════ STEP 1 — Gig type ══════════════════ */}
          {step === 1 && (
            <div className="animate-rise space-y-7">

              {/* Trust signals — shown only on first screen */}
              <div
                className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl px-5 py-3"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  { icon: "🔒", text: "256-bit encryption" },
                  { icon: "✓", text: "SOC 2 Type II certified" },
                  { icon: "★", text: "12,400+ gig workers filed" },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: "#00FF85" }}>{icon}</span>
                    <span className="text-[11px] font-medium" style={{ color: "#888888" }}>{text}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "rgba(0,255,133,0.7)" }}>
                  Step 1 of 3
                </p>
                <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#EDEDED] mb-3">
                  What's your gig?
                </h1>
                <p className="text-[14px] leading-relaxed" style={{ color: "#888888" }}>
                  GigATax tailors your deductions to how you actually earn. Pick everything that applies.
                </p>
              </div>

              <input
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search gig types..."
                className="giga-input"
                autoFocus
              />

              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#3B82F6" }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredGigs.map((gig) => {
                    const selected = selectedGigs.includes(gig);
                    return (
                      <button
                        key={gig}
                        onClick={() => toggleGig(gig)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[13px] font-medium transition-all duration-150 active:scale-[0.97]"
                        style={
                          selected
                            ? { background: "rgba(0,255,133,0.08)", border: "1px solid rgba(0,255,133,0.35)", color: "#00FF85", boxShadow: "0 0 16px rgba(0,255,133,0.06)" }
                            : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#888888" }
                        }
                      >
                        <span
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: selected ? "rgba(0,255,133,0.15)" : "rgba(255,255,255,0.05)", color: selected ? "#00FF85" : "#555555" }}
                        >
                          {GIG_ICONS[gig] ?? <Sparkles className="h-4 w-4" />}
                        </span>
                        {gig}
                        {selected && <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0" style={{ color: "#00FF85" }} />}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="space-y-3">
                {selectedGigs.length > 0 && (
                  <p className="text-center text-[12px]" style={{ color: "#888888" }}>
                    {selectedGigs.length} selected: <span style={{ color: "#00FF85" }}>{selectedGigs.join(", ")}</span>
                  </p>
                )}
                <button
                  onClick={() => setStep(2)}
                  disabled={selectedGigs.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ background: "#3B82F6", color: "#ffffff" }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════ STEP 2 — Connect accounts ══════════════════ */}
          {step === 2 && (
            <div className="animate-rise space-y-7">
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "rgba(59,130,246,0.8)" }}>
                  Step 2 of 3
                </p>
                <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#EDEDED] mb-3">
                  Connect your platforms
                </h1>
                <p className="text-[14px] leading-relaxed" style={{ color: "#888888" }}>
                  Link the platforms you actually earn from. GigATax pulls income and mileage automatically so you never manually log a thing.
                </p>
              </div>

              <div className="space-y-2.5">
                {integrations.map((integration) => {
                  const connected = integration.connected;
                  // Pick a platform icon by id
                  const PlatformIcon = {
                    bank: Link2,
                    youtube: Video,
                    paypal:  Sparkles,
                    stripe:  BarChart3,
                    twitch:  Radio,
                    patreon: Music,
                  }[integration.id] ?? Link2;

                  return (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between rounded-2xl px-5 py-4 transition-all duration-150"
                      style={{
                        background: connected ? "rgba(0,255,133,0.04)" : "rgba(255,255,255,0.03)",
                        border: connected ? "1px solid rgba(0,255,133,0.2)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                          style={{ background: connected ? "rgba(0,255,133,0.1)" : "rgba(255,255,255,0.05)" }}
                        >
                          <PlatformIcon className="h-5 w-5" style={{ color: connected ? "#00FF85" : "#555555" }} />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#EDEDED]">{integration.name}</p>
                          <p className="text-[11px]" style={{ color: "#555555" }}>
                            {connected && integration.lastSyncAt
                              ? `Synced ${new Date(integration.lastSyncAt).toLocaleDateString()}`
                              : integration.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => void handleIntegrationConnect(integration)}
                        disabled={isPlaidConnecting && integration.id === "bank"}
                        className="flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-all duration-150 active:scale-[0.96]"
                        style={
                          connected
                            ? { background: "rgba(0,255,133,0.1)", border: "1px solid rgba(0,255,133,0.3)", color: "#00FF85" }
                            : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#EDEDED" }
                        }
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        {isPlaidConnecting && integration.id === "bank"
                          ? "Connecting..."
                          : connected
                            ? "Connected"
                            : "Connect"}
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="text-center text-[12px]" style={{ color: "#555555" }}>
                You can connect more sources later from Settings.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl py-3.5 text-[13px] font-semibold transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#888888" }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                  style={{ background: "#3B82F6", color: "#ffffff" }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════ STEP 3 — Upload 1099s ══════════════════ */}
          {step === 3 && (
            <div className="animate-rise space-y-7">
              <div className="text-center">
                <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "rgba(59,130,246,0.8)" }}>
                  Step 3 of 3
                </p>
                <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#EDEDED] mb-3">
                  Upload your 1099s
                </h1>
                <p className="text-[14px] leading-relaxed" style={{ color: "#888888" }}>
                  GigATax reads your 1099-K, 1099-NEC, and 1099-MISC to pre-fill your income automatically. PDF or image — we handle it.
                </p>
              </div>

              {/* ── Drop zone ── */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className="relative flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-200 select-none"
                style={{
                  minHeight: "180px",
                  padding: "36px 24px",
                  background: isDragging
                    ? "rgba(59,130,246,0.07)"
                    : "rgba(255,255,255,0.02)",
                  border: isDragging
                    ? "2px dashed rgba(59,130,246,0.6)"
                    : "2px dashed rgba(255,255,255,0.1)",
                  boxShadow: isDragging
                    ? "0 0 0 4px rgba(59,130,246,0.08), inset 0 0 40px rgba(59,130,246,0.04)"
                    : "none",
                }}
              >
                {/* Icon cluster */}
                <div className="relative mb-4">
                  {/* Glow behind icon */}
                  {isDragging && (
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-60"
                      style={{ background: "#3B82F6", width: "56px", height: "56px", transform: "translate(-4px,-4px)" }}
                    />
                  )}
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                      background: isDragging ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                      border: isDragging ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <UploadCloud
                      className="h-6 w-6 transition-transform duration-200"
                      style={{
                        color: isDragging ? "#3B82F6" : "#555555",
                        transform: isDragging ? "translateY(-2px)" : "none",
                      }}
                    />
                  </div>
                </div>

                <p className="text-[14px] font-semibold text-[#EDEDED] mb-1">
                  {isDragging ? "Drop to upload" : "Drop 1099 files here"}
                </p>
                <p className="text-[12px]" style={{ color: "#555555" }}>
                  or{" "}
                  <span className="font-medium" style={{ color: "#3B82F6" }}>
                    click to browse
                  </span>
                  {" "}· PDF, PNG, JPG up to 20 MB each
                </p>

                {/* Supported form types */}
                <div className="flex items-center gap-2 mt-4">
                  {["1099-K", "1099-NEC", "1099-MISC"].map((t) => (
                    <span
                      key={t}
                      className="chip"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#555555" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />

              {/* ── Uploaded files list ── */}
              {forms.length > 0 && (
                <div className="space-y-2">
                  {/* Income tally */}
                  {totalDetectedIncome > 0 && (
                    <div
                      className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
                      style={{
                        background: "rgba(0,255,133,0.05)",
                        border: "1px solid rgba(0,255,133,0.2)",
                      }}
                    >
                      <p className="text-[12px] font-medium" style={{ color: "#888888" }}>
                        Total 1099 income detected
                      </p>
                      <p className="mn text-[15px] font-bold" style={{ color: "#00FF85" }}>
                        ${totalDetectedIncome.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {forms.map((form) => (
                    <div
                      key={form.id}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
                      style={{
                        background: form.status === "done"
                          ? "rgba(0,255,133,0.03)"
                          : "rgba(255,255,255,0.03)",
                        border: form.status === "done"
                          ? "1px solid rgba(0,255,133,0.15)"
                          : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {/* File icon */}
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: form.status === "done" ? "rgba(0,255,133,0.1)" : "rgba(255,255,255,0.05)",
                        }}
                      >
                        {form.status === "pending" ? (
                          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#3B82F6" }} />
                        ) : (
                          <FileText className="h-4 w-4" style={{ color: "#00FF85" }} />
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#EDEDED] truncate">{form.name}</p>
                        {form.status === "pending" ? (
                          <p className="text-[11px]" style={{ color: "#3B82F6" }}>Scanning…</p>
                        ) : (
                          <p className="text-[11px]" style={{ color: "#555555" }}>
                            {form.payer} · {formatBytes(form.size)}
                          </p>
                        )}
                      </div>

                      {/* Parsed income */}
                      {form.status === "done" && form.income && (
                        <p className="mn text-[13px] font-semibold flex-shrink-0" style={{ color: "#00FF85" }}>
                          +${form.income.toLocaleString()}
                        </p>
                      )}

                      {/* Remove */}
                      <button
                        onClick={() => removeForm(form.id)}
                        className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-150"
                        style={{ color: "#555555" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#555555")}
                        aria-label="Remove file"
                      >
                        {form.status === "pending" ? <X className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Skip hint */}
              <p className="text-center text-[12px]" style={{ color: "#555555" }}>
                No 1099s yet? You can upload them later from the Receipt Capture page.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl py-3.5 text-[13px] font-semibold transition-all duration-150"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#888888" }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => void handleFinish()}
                  disabled={isSaving}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold transition-all duration-150 disabled:opacity-40 active:scale-[0.98]"
                  style={{ background: "#00FF85", color: "#050505" }}
                >
                  {isSaving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Setting up your workspace…</>
                  ) : forms.length > 0 ? (
                    <><CheckCircle2 className="h-4 w-4" /> Import & Launch GigATax</>
                  ) : (
                    <><ArrowRight className="h-4 w-4" /> Skip & Launch GigATax</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════ STEP 4 — You're in ══════════════════ */}
          {step === 4 && (
            <div className="animate-rise text-center space-y-8">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: "#00FF85" }} />
                  <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ background: "rgba(0,255,133,0.1)", border: "1px solid rgba(0,255,133,0.35)", boxShadow: "0 0 40px rgba(0,255,133,0.2)" }}
                  >
                    <CheckCircle2 className="h-9 w-9" style={{ color: "#00FF85" }} />
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#EDEDED] mb-3">
                  You're all set.
                </h1>
                <p className="text-[14px] leading-relaxed" style={{ color: "#888888" }}>
                  GigATax is analyzing your transactions and identifying deductions in the background. Your Command Center is ready.
                </p>
              </div>

              <div className="space-y-2 text-left">
                {[
                  { icon: <BarChart3 className="h-4 w-4" />, text: "Dashboard with real-time savings counter" },
                  { icon: <Sparkles className="h-4 w-4" />, text: "AI-categorized transaction feed" },
                  { icon: <Zap className="h-4 w-4" />, text: "Mileage deduction slider — find money in minutes" },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span style={{ color: "#00FF85" }}>{icon}</span>
                    <p className="text-[13px] text-[#EDEDED]">{text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all duration-150 active:scale-[0.98]"
                style={{ background: "#00FF85", color: "#050505", boxShadow: "0 0 32px rgba(0,255,133,0.25)" }}
              >
                Enter GigATax
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center">
        <p className="text-[11px]" style={{ color: "#333333" }}>
          GigATax · TurboTax for the Gig Economy · Tax Year 2026
        </p>
      </footer>
    </div>
  );
}
