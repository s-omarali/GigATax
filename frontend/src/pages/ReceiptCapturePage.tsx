import { Camera, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { scanReceiptFile } from "../services/mockApi";
import type { Transaction } from "../types/domain";
import { LoadingState } from "../components/state/LoadingState";
import { SuccessState } from "../components/state/SuccessState";

export function ReceiptCapturePage() {
  const [fileName, setFileName] = useState("");
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

  async function handleScan() {
    if (!fileName) return;
    setSaved(false);
    setIsScanning(true);
    const result = await scanReceiptFile(fileName);
    setScanResult(result);
    setCategory(result.suggestedCategory);
    setIsScanning(false);
  }

  function handleSave() {
    setSaved(true);
  }

  return (
    <div className="space-y-4 animate-rise">
      <header className="bento-card p-5">
        <p className="text-xs uppercase tracking-wider text-neon-cyan">Smart Receipt Capture</p>
        <h1 className="text-3xl font-black text-white">Upload, Scan, and Classify in Seconds</h1>
      </header>

      <section className="bento-card p-5">
        <label className="mb-3 block text-sm text-slate-300">Receipt image file name</label>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            placeholder="example: shell_april_receipt.jpg"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
          />
          <button
            onClick={() => void handleScan()}
            disabled={!fileName || isScanning}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 font-semibold text-ink-950 disabled:bg-slate-700 disabled:text-slate-400"
          >
            <Upload className="h-4 w-4" />
            Start OCR Scan
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">This mocks uploading a receipt image and receiving OCR output.</p>
      </section>

      {isScanning && <LoadingState title="OCR Scanning" description="Extracting merchant, amount, and date from your receipt image..." />}

      {scanResult && !isScanning && (
        <section className="bento-card space-y-4 p-5">
          <div className="flex items-center gap-2 text-neon-cyan">
            <Camera className="h-4 w-4" />
            <p className="text-sm font-semibold">Scan Complete</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">
            <p className="text-slate-200">Merchant: <strong>{scanResult.merchant}</strong></p>
            <p className="text-slate-200">Amount: <strong>${scanResult.amount.toFixed(2)}</strong></p>
            <p className="text-slate-200">Date: <strong>{scanResult.date}</strong></p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Put this in category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as Transaction["category"])}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
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
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Apply this to custom rule</span>
              <input
                value={customRule}
                onChange={(event) => setCustomRule(event.target.value)}
                placeholder="e.g., Treat all Shell receipts as Vehicle"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-neon-cyan"
              />
            </label>
          </div>

          <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-neon-mint/20 px-4 py-2 font-semibold text-neon-mint">
            <Sparkles className="h-4 w-4" />
            Save Classification
          </button>
        </section>
      )}

      {saved && <SuccessState title="Receipt saved" description={`Applied category ${category}${customRule ? ` and rule "${customRule}"` : ""}.`} />}
    </div>
  );
}
