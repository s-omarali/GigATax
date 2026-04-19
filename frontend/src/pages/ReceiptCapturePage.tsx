import { Camera, FileText, Loader2, Sparkles, Upload, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { LoadingState } from "../components/state/LoadingState";
import { SuccessState } from "../components/state/SuccessState";
import { scanReceiptFile } from "../services/api";
import type { Transaction } from "../types/domain";

type ActiveTab = "receipt" | "form1099";

interface Form1099File {
  id: string;
  name: string;
  size: number;
  status: "pending" | "done";
  payer?: string;
  income?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MOCK_1099_RESULTS: Array<{ payer: string; income: number }> = [
  { payer: "YouTube LLC",    income: 18400 },
  { payer: "Patreon Inc.",   income: 9200  },
  { payer: "Stripe Inc.",    income: 4750  },
  { payer: "PayPal Inc.",    income: 3100  },
];

export function ReceiptCapturePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("receipt");

  // ── Receipt scan state ──────────────────────────────────────────
  const [fileName, setFileName] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDragging, setReceiptDragging] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    merchant: string;
    amount: number;
    date: string;
    suggestedCategory: Transaction["category"];
  } | null>(null);
  const [category, setCategory] = useState<Transaction["category"]>("Uncategorized");
  const [customRule, setCustomRule] = useState("");
  const [saved, setSaved] = useState(false);

  // ── 1099 upload state ───────────────────────────────────────────
  const [files1099, setFiles1099] = useState<Form1099File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  async function handleScan() {
    if (!receiptFile) return;
    setSaved(false);
    setIsScanning(true);
    const result = await scanReceiptFile(receiptFile);
    setScanResult(result);
    setCategory(result.suggestedCategory);
    setIsScanning(false);
  }

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const newEntries: Form1099File[] = arr.map((f) => ({
      id: `${f.name}-${Date.now()}`,
      name: f.name,
      size: f.size,
      status: "pending",
    }));
    setFiles1099((prev) => [...prev, ...newEntries]);

    // mock OCR with staggered delay
    newEntries.forEach((entry, idx) => {
      setTimeout(() => {
        const mock = MOCK_1099_RESULTS[idx % MOCK_1099_RESULTS.length];
        setFiles1099((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "done", payer: mock.payer, income: mock.income }
              : f
          )
        );
      }, 1200 + idx * 600);
    });
  }, []);

  function handleDrop1099(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  function handleReceiptDrop(e: React.DragEvent) {
    e.preventDefault();
    setReceiptDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFileName(f.name); setReceiptFile(f); }
  }

  function handleReceiptFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFileName(f.name); setReceiptFile(f); }
  }

  const totalIncome = files1099
    .filter((f) => f.status === "done")
    .reduce((sum, f) => sum + (f.income ?? 0), 0);

  return (
    <div className="space-y-6 animate-rise">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(59,130,246,0.85)" }}>
          Receipts & tax forms
        </p>
        <h1 className="text-[1.6rem] font-extrabold text-[#EDEDED] leading-tight">
          Upload receipts and forms
        </h1>
        <p className="text-[13px] mt-2" style={{ color: "#888888" }}>
          Receipts cover day-to-day expenses. 1099s report income from payers. Same upload flow for both.
        </p>
      </div>

      {/* ── Tab switcher ────────────────────────────────────────── */}
      <div
        className="flex gap-1 rounded-2xl p-1"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {([
          { id: "receipt" as ActiveTab,  label: "Receipts (expenses)", icon: Camera   },
          { id: "form1099" as ActiveTab, label: "1099s (income)",      icon: FileText },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150"
            style={
              activeTab === id
                ? {
                    background: "rgba(59,130,246,0.14)",
                    border: "1px solid rgba(59,130,246,0.28)",
                    color: "#EDEDED",
                  }
                : {
                    background: "transparent",
                    border: "1px solid transparent",
                    color: "#888888",
                  }
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: Scan a Receipt ══════════════════════ */}
      {activeTab === "receipt" && (
        <>
          <section className="bento-card" style={{ padding: "24px" }}>
            <p className="text-[13px] font-extrabold text-[#EDEDED] mb-1">Receipts — everyday purchases</p>
            <p className="text-[12px] mb-5" style={{ color: "#888888" }}>
              Gas, gear, software, whatever. Drop a pic/PDF and we&apos;ll pull merchant + total so you don&apos;t type it.
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => receiptInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && receiptInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setReceiptDragging(true); }}
              onDragLeave={() => setReceiptDragging(false)}
              onDrop={handleReceiptDrop}
              className="relative flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-200 select-none"
              style={{
                minHeight: "180px",
                padding: "36px 24px",
                background: receiptDragging
                  ? "rgba(59,130,246,0.07)"
                  : "rgba(255,255,255,0.02)",
                border: receiptDragging
                  ? "2px dashed rgba(59,130,246,0.6)"
                  : "2px dashed rgba(255,255,255,0.1)",
                boxShadow: receiptDragging
                  ? "0 0 0 4px rgba(59,130,246,0.08), inset 0 0 40px rgba(59,130,246,0.04)"
                  : "none",
              }}
            >
              <input
                ref={receiptInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleReceiptFilePick}
              />
              <div className="relative mb-4">
                {receiptDragging && (
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-60"
                    style={{ background: "#3B82F6", width: "56px", height: "56px", transform: "translate(-4px,-4px)" }}
                  />
                )}
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    background: receiptDragging ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)",
                    border: receiptDragging ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <UploadCloud
                    className="h-6 w-6 transition-transform duration-200"
                    style={{
                      color: receiptDragging ? "#3B82F6" : "#555555",
                      transform: receiptDragging ? "translateY(-2px)" : "none",
                    }}
                  />
                </div>
              </div>

              <p className="text-[14px] font-semibold text-[#EDEDED] mb-1">
                {receiptDragging ? "Drop it" : "Drop a receipt here"}
              </p>
              <p className="text-[12px]" style={{ color: "#555555" }}>
                or{" "}
                <span className="font-medium" style={{ color: "#3B82F6" }}>
                  click to browse
                </span>
                {" "}· PDF, PNG, JPG
              </p>
              {fileName ? (
                <p className="text-[12px] mt-4 font-mono truncate max-w-full px-2" style={{ color: "#00FF85" }}>
                  Selected: {fileName}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => void handleScan()}
                disabled={!receiptFile || isScanning}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-[13px] font-extrabold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#3B82F6", color: "#ffffff" }}
              >
                <Upload className="h-4 w-4" />
                Scan it
              </button>
            </div>
          </section>

          {isScanning && (
            <LoadingState title="Scanning receipt" description="Extracting merchant, amount, and date…" />
          )}

          {scanResult && !isScanning && (
            <section className="bento-card space-y-5" style={{ padding: "24px" }}>
              <div className="flex items-center gap-2" style={{ color: "#3B82F6" }}>
                <Camera className="h-4 w-4" />
                <p className="text-[13px] font-semibold">Scan complete</p>
              </div>

              <div
                className="rounded-xl px-4 py-4 space-y-1.5"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-[13px] text-[#EDEDED]">Merchant: <span className="font-semibold">{scanResult.merchant}</span></p>
                <p className="text-[13px] text-[#EDEDED]">Amount: <span className="mn font-semibold">${scanResult.amount.toFixed(2)}</span></p>
                <p className="text-[13px] text-[#EDEDED]">Date: <span className="font-semibold">{scanResult.date}</span></p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[12px] font-medium" style={{ color: "#888888" }}>Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Transaction["category"])}
                    className="giga-input"
                  >
                    <option>Software</option>
                    <option>Travel</option>
                    <option>Meals</option>
                    <option>Vehicle</option>
                    <option>Supplies</option>
                    <option>Home Office</option>
                    <option>Uncategorized</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-medium" style={{ color: "#888888" }}>Custom rule (optional)</span>
                  <input
                    value={customRule}
                    onChange={(e) => setCustomRule(e.target.value)}
                    placeholder="e.g., All Shell receipts → Vehicle"
                    className="giga-input"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setSaved(true)}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-extrabold transition-all duration-150"
                style={{ background: "rgba(0,255,133,0.1)", border: "1px solid rgba(0,255,133,0.3)", color: "#00FF85" }}
              >
                <Sparkles className="h-4 w-4" />
                Save classification
              </button>
            </section>
          )}

          {saved && (
            <SuccessState
              title="LET'S GO."
              description={`Saved as "${category}"${customRule ? ` · rule: "${customRule}"` : ""}.`}
            />
          )}
        </>
      )}

      {/* ══════════════ TAB: Upload 1099 Forms ═══════════════════ */}
      {activeTab === "form1099" && (
        <>
          <section className="bento-card" style={{ padding: "24px" }}>
            <p className="text-[13px] font-extrabold text-[#EDEDED] mb-1">1099 income forms</p>
            <p className="text-[12px] mb-2" style={{ color: "#888888" }}>
              Not receipts — these are information returns: 1099-NEC, 1099-K, and similar forms payers file to report what they paid you.
            </p>
            <p className="text-[12px] mb-5" style={{ color: "#666666" }}>
              Upload PDF or image. We read payer names and income totals for your return.
            </p>

            {/* Drop zone */}
            <div
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop1099}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl py-12 px-6 text-center transition-all duration-200 cursor-pointer"
              style={{
                border: dragActive
                  ? "2px dashed rgba(59,130,246,0.6)"
                  : "2px dashed rgba(255,255,255,0.1)",
                background: dragActive
                  ? "rgba(59,130,246,0.06)"
                  : "rgba(255,255,255,0.02)",
                boxShadow: dragActive ? "0 0 32px rgba(59,130,246,0.12)" : "none",
              }}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".pdf,.jpg,.png";
                input.multiple = true;
                input.onchange = () => { if (input.files) addFiles(input.files); };
                input.click();
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  background: dragActive ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  boxShadow: dragActive ? "0 0 24px rgba(59,130,246,0.2)" : "none",
                }}
              >
                <UploadCloud
                  className="h-6 w-6 transition-colors duration-200"
                  style={{ color: dragActive ? "#3B82F6" : "#555555" }}
                />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#EDEDED]">
                  {dragActive ? "Drop to upload" : "Drop 1099s here, or click to browse"}
                </p>
                <p className="text-[12px] mt-1" style={{ color: "#555555" }}>
                  PDF, JPG, or PNG · 1099-NEC and 1099-K accepted
                </p>
              </div>
            </div>
          </section>

          {/* Uploaded files list */}
          {files1099.length > 0 && (
            <section className="bento-card space-y-3" style={{ padding: "24px" }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[13px] font-semibold text-[#EDEDED]">Uploaded forms</h2>
                {totalIncome > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]" style={{ color: "#888888" }}>Total income found:</span>
                    <span className="mn text-[13px] font-bold" style={{ color: "#00FF85" }}>
                      ${totalIncome.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {files1099.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: f.status === "done"
                      ? "rgba(0,255,133,0.03)"
                      : "rgba(255,255,255,0.025)",
                    border: f.status === "done"
                      ? "1px solid rgba(0,255,133,0.15)"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    {f.status === "pending"
                      ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#3B82F6" }} />
                      : <FileText className="h-4 w-4" style={{ color: "#00FF85" }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#EDEDED] truncate">{f.name}</p>
                    {f.status === "done" && f.payer ? (
                      <p className="text-[11px]" style={{ color: "#888888" }}>
                        Payer: <span className="text-[#EDEDED] font-medium">{f.payer}</span>
                      </p>
                    ) : (
                      <p className="text-[11px]" style={{ color: "#555555" }}>
                        {formatBytes(f.size)} · Reading form…
                      </p>
                    )}
                  </div>
                  {f.status === "done" && f.income != null && (
                    <p className="mn flex-shrink-0 text-[13px] font-bold" style={{ color: "#00FF85" }}>
                      +${f.income.toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
