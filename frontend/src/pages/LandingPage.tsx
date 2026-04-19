import {
  ArrowRight,
  Gamepad2,
  Link2,
  Palette,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GigaTaxWordmark } from "../components/branding/GigaTaxWordmark";
import { formatCurrency, getEstimatedTaxSavings } from "../utils/taxMath";

const TAX_YEAR = 2026;

/** Demo marginal rate for the hero nudge only — same order of magnitude as elsewhere in the app. */
const HERO_DEMO_MARGINAL = 0.24;

const ICON_MUTED = "rgba(0, 255, 133, 0.85)";

/** Hero slider — same bento glass language as the rest of marketing. */
function HeroSavingsNudge() {
  const [studioExpense, setStudioExpense] = useState(4200);
  const savings = useMemo(
    () => getEstimatedTaxSavings(studioExpense, HERO_DEMO_MARGINAL),
    [studioExpense]
  );

  return (
    <aside className="bento-card text-left" aria-labelledby="hero-nudge-title">
      <div className="flex gap-4">
        <div
          className="w-1 shrink-0 self-stretch min-h-[8rem] rounded-full"
          style={{
            background: "linear-gradient(180deg, #00FF85 0%, rgba(0,255,133,0.18) 72%, rgba(0,255,133,0.06) 100%)",
          }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p id="hero-nudge-title" className="text-[13px] font-semibold text-[#EDEDED]">
            Studio &amp; gear spend (demo)
          </p>
          <p className="text-[13px] mt-1.5 leading-relaxed font-normal" style={{ color: "#888888" }}>
            Move the slider. Rough federal savings illustration—not a filing number.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="mn text-[22px] font-semibold tabular-nums" style={{ color: "#EDEDED" }}>
                {formatCurrency(studioExpense)}
              </span>
              <span className="text-[12px] font-normal" style={{ color: "#666666" }}>
                per year
              </span>
            </div>
            <label className="block">
              <span className="sr-only">Adjust average studio and gear expenses</span>
              <input
                type="range"
                min={0}
                max={24000}
                step={200}
                value={studioExpense}
                onChange={(e) => setStudioExpense(Number(e.target.value))}
                className="w-full h-2 rounded-full cursor-grab active:cursor-grabbing accent-[#00FF85]"
                aria-valuemin={0}
                aria-valuemax={24000}
                aria-valuenow={studioExpense}
              />
            </label>

            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-[12px] font-medium" style={{ color: "#888888" }}>
                Estimated savings (illustrative)
              </p>
              <p className="mn text-[1.65rem] font-semibold mt-1 leading-none" style={{ color: "#00FF85" }}>
                {formatCurrency(savings)}
              </p>
              <p className="text-[11px] mt-2 leading-snug font-normal" style={{ color: "#555555" }}>
                Uses a flat {Math.round(HERO_DEMO_MARGINAL * 100)}% demo rate—not tax advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: "linear-gradient(165deg, #070708 0%, #0a0a0f 38%, #08080d 100%)",
        color: "#EDEDED",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div
          className="landing-orb landing-orb--a absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[180px]"
          style={{ background: "rgba(0,255,133,0.055)" }}
        />
        <div
          className="landing-orb landing-orb--b absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-[160px]"
          style={{ background: "rgba(59,130,246,0.055)" }}
        />
        <div
          className="landing-orb landing-orb--c absolute top-1/2 left-0 w-[400px] h-[400px] -translate-y-1/2 rounded-full blur-[140px] opacity-60"
          style={{ background: "rgba(168,85,247,0.035)" }}
        />
      </div>
      <div className="landing-vignette" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <header
        className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-10 border-b border-white/[0.06] backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,15,0.88) 0%, rgba(10,10,15,0.72) 100%)",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <Link
          to="/"
          className="flex items-center min-w-0 rounded-lg focus-visible:outline-offset-4"
        >
          <div className="min-w-0 text-left">
            <GigaTaxWordmark size="xl" className="block leading-none" />
            <span className="block text-[11px] font-normal leading-snug truncate" style={{ color: "#888888" }}>
              Tax workspace for 1099 creators
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2" aria-label="Primary">
          <Link
            to="/start"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-150 whitespace-nowrap focus-visible:outline-offset-2 border border-white/[0.12] bg-white/[0.04] text-[#EDEDED] hover:bg-white/[0.07] hover:border-white/[0.16] active:scale-[0.98]"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 w-full">
        <section
          className="px-5 sm:px-8 lg:px-10 pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 max-w-6xl mx-auto animate-rise"
          aria-labelledby="landing-hero-heading"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-start">
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
              <p className="text-[12px] font-semibold mb-3 tracking-[0.12em] uppercase font-display" style={{ color: "rgba(0,255,133,0.78)" }}>
                Tax year {TAX_YEAR}
              </p>
              <h1
                id="landing-hero-heading"
                className="font-display text-[1.8rem] sm:text-[2.2rem] xl:text-[2.45rem] font-bold leading-[1.08] tracking-[-0.02em] text-[#EDEDED]"
              >
                Keep more of what you earn on 1099s—with less tax-season dread.
              </h1>
              <p className="mt-5 text-[15px] sm:text-[16px] leading-relaxed max-w-xl mx-auto lg:mx-0 lg:max-w-none font-normal" style={{ color: "#a3a3a3" }}>
                Link payouts and upload 1099s—we surface write-offs and estimates in one dark workspace built for multi-payer income.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  to="/start"
                  className="giga-cta-shimmer inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-[15px] font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-offset-4"
                  style={{
                    background: "linear-gradient(165deg, #12E88C 0%, #00C96F 42%, #00A35C 100%)",
                    color: "#04140e",
                    boxShadow:
                      "0 0 0 1px rgba(0,255,133,0.35), 0 0 48px rgba(0,255,133,0.18), 0 14px 32px rgba(0,0,0,0.55)",
                  }}
                >
                  Get my tax HUD
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-2xl px-5 py-3.5 text-[14px] font-medium text-[#EDEDED] border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06] transition-colors focus-visible:outline-offset-4 backdrop-blur-sm"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
                >
                  How it works
                </a>
              </div>
            </div>

            <div className="lg:col-span-6 xl:col-span-5 order-1 lg:order-2 w-full">
              <HeroSavingsNudge />
            </div>
          </div>
        </section>

        <div
          className="border-t border-white/[0.06]"
          style={{
            background: "linear-gradient(180deg, rgba(5,5,8,0.92) 0%, rgba(6,6,10,0.98) 100%)",
          }}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24 space-y-16 sm:space-y-20">
            <section aria-labelledby="who-heading">
              <div className="max-w-3xl">
                <h2 id="who-heading" className="font-display text-[15px] sm:text-base font-semibold text-[#EDEDED] tracking-tight">
                  Who it&apos;s for
                </h2>
                <p className="mt-2 text-lg sm:text-xl font-display font-semibold text-[#EDEDED] leading-snug tracking-tight">
                  You if your income doesn&apos;t arrive on a W-2.
                </p>
              </div>

              <div className="mt-8 bento-card bento-card--flush overflow-hidden">
                <ul className="divide-y divide-white/[0.06] list-none p-0 m-0">
                  {[
                    {
                      icon: <Gamepad2 className="h-5 w-5 shrink-0" aria-hidden />,
                      title: "Streamers & video creators",
                      body: "Kick, Twitch, YouTube—platform payouts, tips, and brand deals in one place.",
                    },
                    {
                      icon: <Palette className="h-5 w-5 shrink-0" aria-hidden />,
                      title: "Freelance designers & editors",
                      body: "Project checks and 1099-NECs from clients, not a single tidy employer row.",
                    },
                    {
                      icon: <Sparkles className="h-5 w-5 shrink-0" aria-hidden />,
                      title: "Anyone stacking 1099-Ks and NECs",
                      body: "Rideshare, delivery, or side contracts—multiple payers, one workspace.",
                    },
                  ].map((row) => (
                    <li key={row.title} className="flex gap-4 px-5 sm:px-6 py-5 first:pt-6 last:pb-6">
                      <span className="mt-0.5" style={{ color: ICON_MUTED }}>
                        {row.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-[#EDEDED]">{row.title}</p>
                        <p className="text-[13px] mt-1 leading-relaxed font-normal" style={{ color: "#888888" }}>
                          {row.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="how-it-works" className="scroll-mt-24" aria-labelledby="how-heading">
              <div className="max-w-3xl">
                <h2 id="how-heading" className="font-display text-[15px] sm:text-base font-semibold text-[#EDEDED] tracking-tight">
                  How it works
                </h2>
                <p className="mt-2 text-lg font-display font-semibold text-[#EDEDED] tracking-tight">Connect, upload, review.</p>
                <p className="mt-2 text-[14px] leading-relaxed font-normal" style={{ color: "#888888" }}>
                  Same flow you&apos;ll see when you open the app—no brochure-only steps.
                </p>
              </div>

              <ol className="mt-10 bento-card bento-card--flush list-none m-0 grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x md:divide-white/[0.08]">
                {[
                  {
                    n: 1,
                    title: "Connect",
                    body: "Link bank and payout platforms so we can see cash flow the way you actually get paid.",
                    icon: <Link2 className="h-5 w-5" style={{ color: ICON_MUTED }} aria-hidden />,
                  },
                  {
                    n: 2,
                    title: "Upload 1099s",
                    body: "Add 1099-K, 1099-NEC, or 1099-MISC PDFs for payers we do not ingest automatically.",
                    icon: <UploadCloud className="h-5 w-5" style={{ color: ICON_MUTED }} aria-hidden />,
                  },
                  {
                    n: 3,
                    title: "Review savings",
                    body: "Open your dashboard—categorized activity, deduction nudges, and optimization before filing prep.",
                    icon: <Sparkles className="h-5 w-5" style={{ color: ICON_MUTED }} aria-hidden />,
                  },
                ].map((step) => (
                  <li
                    key={step.n}
                    className="flex flex-col items-start px-6 py-7 sm:px-7 sm:py-8 border-b border-white/[0.06] md:border-b-0 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="mn flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
                        style={{
                          background: "rgba(0,255,133,0.1)",
                          color: "#86EFAC",
                          border: "1px solid rgba(0,255,133,0.28)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        {step.n}
                      </span>
                      {step.icon}
                    </div>
                    <p className="mt-4 text-[15px] font-semibold text-[#EDEDED]">{step.title}</p>
                    <p className="mt-2 text-[13px] leading-relaxed font-normal" style={{ color: "#888888" }}>
                      {step.body}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="bento-card max-w-3xl" aria-labelledby="why-heading">
              <div className="border-l-2 pl-5 sm:pl-6" style={{ borderColor: "rgba(0,255,133,0.35)" }}>
                <h2 id="why-heading" className="font-display text-[15px] sm:text-base font-semibold text-[#EDEDED] tracking-tight">
                  Why it&apos;s different
                </h2>
                <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed font-normal" style={{ color: "#a3a3a3" }}>
                  Most tax products still assume a W-2 and a single employer. You have platforms, 1099s, and expenses that only make sense together.
                </p>
                <p className="mt-4 text-[15px] sm:text-[16px] leading-relaxed font-normal" style={{ color: "#a3a3a3" }}>
                  GigATax keeps the picture in one place: income, write-offs, and what&apos;s still worth a second look—without turning the screen into a brochure.
                </p>
              </div>
            </section>

            <section className="bento-card" aria-label="Security and demo notice">
              <div className="max-w-3xl space-y-4 text-[13px] leading-relaxed font-normal" style={{ color: "#666666" }}>
                <p>
                  <span className="font-medium text-[#a3a3a3]">Encryption.</span> Data in transit is encrypted. This is a
                  prototype—don&apos;t upload real SSNs or secrets.
                </p>
                <p>
                  <span className="font-medium text-[#a3a3a3]">Read-only.</span> We don&apos;t move money or file for you in
                  this build. You get visibility and demo estimates only.
                </p>
                <p className="text-[12px]" style={{ color: "#555555" }}>
                  Hackathon demo with mocked data. When it matters, talk to a licensed preparer.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto px-5 sm:px-8 lg:px-10 py-8 border-t border-white/[0.06] text-center backdrop-blur-sm" style={{ background: "rgba(6,6,10,0.5)" }}>
        <p className="text-[12px] font-normal flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1" style={{ color: "#555555" }}>
          <span>© {TAX_YEAR}</span>
          <GigaTaxWordmark size="xs" tone="subtle" />
          <span>· Not individualized tax advice, audit defense, or filing representation.</span>
        </p>
      </footer>
    </div>
  );
}
