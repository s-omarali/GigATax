import { Link } from "react-router-dom";
import { GigaTaxWordmark } from "../components/branding/GigaTaxWordmark";

const TAX_YEAR = 2026;

const TICKER_ITEMS = [
  "Deduct your ring light",
  "Multi-platform income",
  "Brand deal tracking",
  "Write off your streaming chair",
  "Merch sales handled",
  "Freelance & 1099 forms",
] as const;

/** Bento panel: crisp border, subtle glass — no offset “brutal” shadow stack. */
function bentoPanelClass(extra = "") {
  return `border border-white/[0.06] ring-1 ring-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.28)] transition-all duration-200 hover:border-white/[0.12] hover:ring-white/[0.14] hover:bg-white/[0.03] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_34px_rgba(0,0,0,0.34)] ${extra}`.trim();
}

export function LandingPage() {
  return (
    <div className="min-h-screen scroll-smooth text-fg overflow-x-hidden bg-[#0a0a0a]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
        <div
          className="landing-orb landing-orb--a absolute -top-44 left-1/2 -translate-x-1/2 w-[840px] h-[620px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle at center, rgba(0,255,133,0.2) 0%, rgba(0,255,133,0.04) 42%, rgba(0,255,133,0) 74%)" }}
        />
        <div
          className="landing-orb landing-orb--b absolute -bottom-10 right-[-5%] w-[680px] h-[560px] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle at center, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.05) 46%, rgba(59,130,246,0) 76%)" }}
        />
      </div>
      <div className="landing-vignette" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <header
        className="fixed top-0 left-0 right-0 z-[100] flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10 border-b border-white/[0.06] ring-1 ring-white/[0.05] backdrop-blur-xl bg-[#0a0a0a]/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      >
        <Link
          to="/"
          className="flex items-center min-w-0 rounded-lg focus-visible:outline-offset-4 shrink-0"
          aria-label="GigATax home"
        >
          <GigaTaxWordmark size="lg" className="leading-none" />
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-[13px] font-sans text-fg-muted" aria-label="Marketing">
          <Link
            to="/waitlist"
            className="inline-flex items-center justify-center rounded-lg px-[18px] py-2 text-[14px] font-semibold font-sans tracking-normal bg-green text-[#04140e] transition-all duration-200 hover:opacity-95 hover:shadow-[0_0_0_1px_rgba(0,255,133,0.45),0_8px_28px_rgba(0,255,133,0.22)] active:scale-[0.99]"
          >
            Save now
          </Link>
        </nav>
      </header>

      <main className="relative z-10 pt-[72px] sm:pt-[80px]">
        {/* First viewport: hero + marquee; marquee sits at bottom of screen on load */}
        <div className="flex min-h-[calc(100dvh-72px)] sm:min-h-[calc(100dvh-80px)] flex-col">
        {/* Hero — no status pill, no arcade duplicate; breathing room above headline */}
        <section
          className="relative isolate flex min-h-0 flex-1 flex-col px-5 sm:px-8 lg:px-10 pt-20 sm:pt-24 pb-6 sm:pb-8 max-w-[1100px] mx-auto w-full overflow-hidden"
          aria-labelledby="landing-hero-title"
        >
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
            <div
              className="absolute -top-24 left-[12%] h-[360px] w-[360px] rounded-full blur-3xl opacity-20"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,255,133,0.28) 0%, rgba(0,255,133,0.07) 48%, rgba(0,255,133,0) 76%)",
              }}
            />
            <div
              className="absolute top-10 right-[6%] h-[320px] w-[320px] rounded-full blur-3xl opacity-15"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.24) 0%, rgba(59,130,246,0.06) 46%, rgba(59,130,246,0) 74%)",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_45%_18%,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_34%,rgba(0,0,0,0)_70%)]" />
          </div>

          <h1
            id="landing-hero-title"
            className="font-display font-extrabold text-[clamp(2.5rem,7vw,5.25rem)] leading-[1.02] tracking-[-0.06em] mb-6 text-balance max-w-[18ch] sm:max-w-none bg-gradient-to-b from-white via-white/95 to-white/65 bg-clip-text text-transparent [text-shadow:0_1px_0_rgba(255,255,255,0.05)]"
          >
            Taxes for
            <br />
            people who
            <br />
            <span className="text-green [text-shadow:0_0_24px_rgba(0,255,133,0.22)]">hustle weird.</span>
          </h1>

          <p className="font-sans text-[clamp(0.875rem,1.5vw,1rem)] uppercase tracking-[0.12em] mb-10 text-fg-muted max-w-md">
            // <span className="text-green font-medium">more money, less problems</span>
          </p>

          <p className="font-sans text-[17px] sm:text-[18px] max-w-[42rem] mb-12 leading-relaxed text-fg-muted">
            Stop leaving money on the table. We automatically handle your expenses so you can get back to creating
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/waitlist"
              className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-[16px] font-semibold font-sans bg-green text-[#04140e] transition-all duration-200 hover:opacity-95 hover:shadow-[0_0_0_1px_rgba(0,255,133,0.45),0_10px_30px_rgba(0,255,133,0.24)] active:scale-[0.99]"
            >
              Join the Waitlist
            </Link>
          </div>

          <p className="font-mono text-[11px] mt-8 tracking-wide text-fg-faint max-w-md pb-8 sm:pb-10 md:pb-12">
            // No CPA required. No spreadsheets. No crying.
          </p>

        </section>

        {/* Single full-bleed marquee — neon #00FF85 only */}
        <div
          className="relative left-1/2 mt-auto w-screen max-w-[100vw] -translate-x-1/2 shrink-0 border-y border-white/[0.05] bg-[#050505] py-3.5 overflow-x-hidden"
          aria-hidden
        >
          <div className="flex w-max animate-landing-marquee" style={{ animationDuration: "22s" }}>
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 gap-14 sm:gap-16 pr-14 sm:pr-16">
                {TICKER_ITEMS.map((label) => (
                  <span
                    key={`${dup}-${label}`}
                    className="inline-flex items-center gap-2 font-sans text-[12px] sm:text-[13px] uppercase tracking-[0.1em] whitespace-nowrap text-[#00FF85]"
                  >
                    <span className="text-[#00FF85]" aria-hidden>
                      ✓
                    </span>
                    {label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        </div>

        {/* Problem */}
        <section id="situation" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-green mb-4">// The situation</p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-6 text-balance max-w-[20ch] sm:max-w-[28ch]">
            The IRS wasn&apos;t built
            <br />
            for your <em className="text-green not-italic">vibe.</em>
          </h2>
          <p className="font-sans text-[17px] max-w-[40rem] mb-14 leading-relaxed text-fg-muted">
            Tax software was designed in 1987 for people with one employer and zero brand deals. You are not that person.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-8 sm:p-9 rounded-xl ${bentoPanelClass()}`}>
              <span className="inline-block font-mono text-[10px] px-2 py-1 rounded border border-white/[0.06] mb-4 tracking-wide bg-red-dim text-red">
                BEFORE GIGATAX
              </span>
              <span className="text-[26px] block mb-4" aria-hidden>
                😵
              </span>
              <h3 className="font-display font-bold text-xl tracking-tight text-fg mb-3">The old way</h3>
              <p className="font-sans text-[15px] leading-relaxed text-fg-muted max-w-prose">
                Googling &quot;is my microphone tax deductible&quot; at 11pm, exporting CSVs from 4 platforms, sobbing into a TurboTax form that was clearly built for your accountant uncle named Gary.
              </p>
            </div>
            <div className={`p-8 sm:p-9 rounded-xl ${bentoPanelClass("border-green/25 bg-green-dim/30")}`}>
              <span className="inline-block font-mono text-[10px] px-2 py-1 rounded border border-green/30 mb-4 tracking-wide text-green">
                WITH GIGATAX
              </span>
              <span className="text-[26px] block mb-4" aria-hidden>
                🤑
              </span>
              <h3 className="font-display font-bold text-xl tracking-tight text-green mb-3">The GigaTax way</h3>
              <p className="font-sans text-[15px] leading-relaxed text-fg-muted max-w-prose">
                Connect your platforms, we find every deduction, you file in under an hour. The IRS gets what it needs. You keep what you earned. Gary gets a thank-you card.
              </p>
            </div>
          </div>
        </section>

        {/* Who */}
        <section id="who-its-for" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-green mb-4">// Who it&apos;s for</p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-6 text-balance max-w-[18ch] sm:max-w-none">
            If you get paid to
            <br />
            make stuff, <em className="text-green not-italic">hi.</em>
          </h2>
          <p className="font-sans text-[17px] max-w-[40rem] mb-12 leading-relaxed text-fg-muted">
            GigaTax is for anyone whose income doesn&apos;t fit in a single box on a W-2. Which is... probably you.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { e: "📱", t: "Content Creators", d: "YouTube, TikTok, Instagram. Ad revenue, sponsorships, tips. We track all of it." },
              { e: "🎮", t: "Streamers", d: "Twitch subs, bits, donations, merch drops. Yes, it's all taxable. Yes, your PC is deductible." },
              { e: "🎨", t: "Artists & Designers", d: "Commissions, print-on-demand, Patreon. We handle the chaos of selling your art online." },
              { e: "🎙️", t: "Podcasters", d: "Sponsorships, Spotify deals, listener support. And yes, your mic setup is a write-off." },
              { e: "💻", t: "Freelancers", d: "1099 city. Multiple clients. Inconsistent pay. We keep it clean so you can keep hustling." },
              { e: "📦", t: "Sellers & Resellers", d: "Etsy, eBay, Amazon, Depop. Sales tax, income tax — it's a lot. We take care of it." },
              { e: "✨", t: "and much more", d: "" },
            ].map((w) => (
              <div
                key={w.t}
                className={`rounded-xl p-6 sm:p-7 transition-colors hover:border-white/[0.1] ${bentoPanelClass()}`}
              >
                <span className="text-[26px] block mb-3" aria-hidden>
                  {w.e}
                </span>
                <h3 className="font-display font-bold text-[15px] tracking-tight text-fg mb-2">{w.t}</h3>
                {w.d ? (
                  <p className="font-sans text-[12px] sm:text-[13px] leading-snug text-fg-muted">{w.d}</p>
                ) : (
                  <p className="font-sans text-[12px] sm:text-[13px] leading-snug text-fg-muted">
                    Our workflows cover the messy edges of modern freelance income.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-5 sm:px-8 lg:px-10 py-10 max-w-[1100px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-[#0a0a0a]/80">
        <GigaTaxWordmark size="sm" className="shrink-0" />
        <p className="font-mono text-[11px] order-last sm:order-none text-fg-faint">
          // taxes for the gig economy · {TAX_YEAR}
        </p>
      </footer>
    </div>
  );
}
