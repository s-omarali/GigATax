import { Link } from "react-router-dom";
import { useCallback, useId, useState } from "react";
import { GigaTaxWordmark } from "../components/branding/GigaTaxWordmark";

const TAX_YEAR = 2026;

const TICKER_ITEMS = [
  "Deduct your ring light",
  "Multi-platform income",
  "Brand deal tracking",
  "Quarterly estimates",
  "Write off your streaming chair",
  "Merch sales handled",
  "Crypto income support",
  "Freelance & 1099 forms",
] as const;

const FAQ_ITEMS = [
  {
    id: "ring-light",
    q: "Is my ring light actually tax deductible?",
    a: "Yes! Any equipment used for your content creation business is deductible — ring lights, cameras, microphones, green screens, capture cards, your fancy chair you bought for \"ergonomics.\" We'll help you document it properly so the IRS doesn't side-eye you.",
  },
  {
    id: "crypto-gifts",
    q: "I got paid in crypto / gifts / random Venmo from fans. Do I have to report that?",
    a: "We know. It's annoying. But yes, generally: income is income. The good news is we track it all and make sure you're reporting it correctly — not over-reporting, not under-reporting. Just the right amount, legally, without drama.",
  },
  {
    id: "w2",
    q: "What if I also have a regular W-2 job?",
    a: 'Classic "side hustle" situation. We merge your W-2 income with your self-employment income, calculate what you owe, find every deduction available to the self-employed portion, and file the whole thing together. It\'s honestly our specialty.',
  },
  {
    id: "quarterly",
    q: "Do I need to pay quarterly taxes?",
    a: "If you expect to owe $1,000 or more when you file, yes. We'll calculate your estimated payments, tell you exactly when to pay, and send you reminders so you don't get hit with penalties. Think of us as your responsible friend who remembers important dates.",
  },
  {
    id: "audit",
    q: "What happens if I get audited?",
    a: "On the Pro plan, we provide audit support — documentation, guidance, and a tax advisor to help you respond. On other plans, your records are organized and exported so you're not scrambling. Statistically, the IRS audits fewer than 1% of individual returns. You're probably fine.",
  },
] as const;

function scrollToId(hash: string) {
  const id = hash.replace(/^#/, "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingPage() {
  const faqHeadingId = useId();
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = useCallback((id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div
      className="min-h-screen scroll-smooth text-fg"
      style={{
        background: "linear-gradient(165deg, #070708 0%, #0a0a0f 38%, #08080d 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden>
        <div
          className="landing-orb landing-orb--a absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[180px]"
          style={{ background: "rgba(0,255,133,0.045)" }}
        />
        <div
          className="landing-orb landing-orb--b absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-[160px]"
          style={{ background: "rgba(59,130,246,0.04)" }}
        />
      </div>
      <div className="landing-vignette" aria-hidden />
      <div className="landing-grain" aria-hidden />

      {/* Top bar — brand wordmark + in-page nav + CTA */}
      <header
        className="fixed top-0 left-0 right-0 z-[100] flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10 border-b border-white/[0.08] backdrop-blur-xl"
        style={{
          background: "rgba(10,10,15,0.92)",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <Link
          to="/"
          className="flex items-center min-w-0 rounded-lg focus-visible:outline-offset-4 shrink-0"
          aria-label="GigATax home"
        >
          <GigaTaxWordmark size="lg" className="leading-none" />
        </Link>

        <nav
          className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-[13px] font-mono"
          style={{ color: "#888888" }}
          aria-label="Marketing"
        >
          <a
            href="#features"
            className="hover:text-fg transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("features");
            }}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="hover:text-fg transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("pricing");
            }}
          >
            Pricing
          </a>
          <a
            href="#who-its-for"
            className="hover:text-fg transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("who-its-for");
            }}
          >
            Who It&apos;s For
          </a>
          <a
            href="#faq"
            className="hover:text-fg transition-colors"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("faq");
            }}
          >
            FAQ
          </a>
          <Link
            to="/start"
            className="inline-flex items-center justify-center rounded-lg px-[18px] py-2 text-[14px] font-semibold font-sans tracking-normal transition-opacity hover:opacity-90"
            style={{
              background: "#00FF85",
              color: "#04140e",
            }}
          >
            Start for free
          </Link>
        </nav>
      </header>

      <main className="relative z-10 pt-[72px] sm:pt-[80px]">
        {/* Hero */}
        <section className="px-5 sm:px-8 lg:px-10 pt-16 sm:pt-20 pb-16 max-w-[1100px] mx-auto" aria-labelledby="landing-hero-title">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-mono tracking-wide mb-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#888888",
            }}
          >
            <span className="neon-dot shrink-0" aria-hidden />
            Tax software that gets the gig economy
          </div>

          <h1
            id="landing-hero-title"
            className="font-display font-extrabold text-[clamp(2.5rem,7vw,5.25rem)] leading-none tracking-[-0.06em] text-fg mb-5"
          >
            Taxes for
            <br />
            people who
            <br />
            <span className="text-green">hustle weird.</span>
          </h1>

          <p className="font-mono text-[clamp(0.875rem,2vw,1.125rem)] uppercase tracking-[0.05em] mb-12" style={{ color: "#888888" }}>
            // <span className="text-green font-medium">more money, less problems</span>
          </p>

          <p className="text-[18px] sm:text-[20px] max-w-[560px] mb-12 leading-relaxed" style={{ color: "#a3a3a3" }}>
            You&apos;ve got 6 income streams, a ring light you definitely need to write off, and a W-2 from that one month you worked at a coffee shop.{" "}
            <strong className="text-fg font-semibold">We get it. We handle it.</strong>
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              to="/start"
              className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-[16px] font-semibold font-sans transition-all hover:-translate-y-px"
              style={{
                background: "#00FF85",
                color: "#04140e",
              }}
            >
              Get your money back →
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-8 py-3.5 text-[16px] font-medium font-sans border transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.14)",
                color: "#EDEDED",
                background: "transparent",
              }}
              onClick={() => scrollToId("features")}
            >
              See how it works
            </button>
          </div>

          <p className="font-mono text-[12px] mt-5 tracking-wide" style={{ color: "#555555" }}>
            // No CPA required. No spreadsheets. No crying.
          </p>

          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-16 sm:mt-20 rounded-xl overflow-hidden border"
            style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.12)" }}
          >
            {[
              { n: "$2.4k", l: "avg. refund per creator" },
              { n: "94%", l: "users file in under 1hr" },
              { n: "87k+", l: "gig workers filed" },
              { n: "0", l: "times you cried doing taxes" },
            ].map((s) => (
              <div key={s.l} className="text-center py-8 px-4" style={{ background: "rgba(22,22,28,0.85)" }}>
                <div className="font-display font-extrabold text-[2.25rem] sm:text-[2.5rem] text-green tracking-tight leading-none mb-1.5 mn">
                  {s.n}
                </div>
                <div className="font-mono text-[11px] sm:text-[12px] uppercase tracking-wide" style={{ color: "#555555" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ticker */}
        <div
          className="border-y overflow-hidden py-3.5 mb-0"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            background: "rgba(15,15,20,0.9)",
          }}
          aria-hidden
        >
          <div className="flex w-max max-w-none animate-landing-marquee">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 gap-16 pr-16">
                {TICKER_ITEMS.map((label) => (
                  <span
                    key={`${dup}-${label}`}
                    className="inline-flex items-center gap-1.5 font-mono text-[13px] uppercase tracking-[0.08em] whitespace-nowrap"
                    style={{ color: "#888888" }}
                  >
                    <span className="text-green">✓</span>
                    {label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Problem */}
        <section id="situation" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-green mb-4">// The situation</p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-5">
            The IRS wasn&apos;t built
            <br />
            for your <em className="text-green not-italic">vibe.</em>
          </h2>
          <p className="text-[18px] max-w-[540px] mb-14 leading-relaxed" style={{ color: "#888888" }}>
            Tax software was designed in 1987 for people with one employer and zero brand deals. You are not that person.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.12)" }}>
            <div className="p-8 sm:p-9" style={{ background: "rgba(22,22,28,0.92)" }}>
              <span
                className="inline-block font-mono text-[11px] px-2.5 py-1 rounded mb-3.5 tracking-wide"
                style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
              >
                BEFORE GIGATAX
              </span>
              <span className="text-[28px] block mb-4" aria-hidden>
                😵
              </span>
              <h3 className="font-display font-bold text-xl tracking-tight text-fg mb-2.5">The old way</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: "#777777" }}>
                Googling &quot;is my microphone tax deductible&quot; at 11pm, exporting CSVs from 4 platforms, sobbing into a TurboTax form that was clearly built for your accountant uncle named Gary.
              </p>
            </div>
            <div className="p-8 sm:p-9" style={{ background: "rgba(30,30,38,0.95)" }}>
              <span
                className="inline-block font-mono text-[11px] px-2.5 py-1 rounded mb-3.5 tracking-wide"
                style={{ background: "rgba(0,255,133,0.12)", color: "#00FF85" }}
              >
                WITH GIGATAX
              </span>
              <span className="text-[28px] block mb-4" aria-hidden>
                🤑
              </span>
              <h3 className="font-display font-bold text-xl tracking-tight text-green mb-2.5">The GigaTax way</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: "#777777" }}>
                Connect your platforms, we find every deduction, you file in under an hour. The IRS gets what it needs. You keep what you earned. Gary gets a thank-you card.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-green mb-4">// What we do</p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-5">
            Built different.
            <br />
            (Like your <em className="text-green not-italic">income.</em>)
          </h2>
          <p className="text-[18px] max-w-[540px] mb-14 leading-relaxed" style={{ color: "#888888" }}>
            Real features for real creator problems. No upsells. No confusing legal jargon. Just your money, handled.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.12)" }}>
            {[
              {
                n: "01 //",
                icon: "🔗",
                t: "Connect everything",
                d: "YouTube, Twitch, TikTok, Etsy, Shopify, Stripe, PayPal. One dashboard. We pull the numbers so you don't have to.",
              },
              {
                n: "02 //",
                icon: "🔍",
                t: "Deduction radar",
                d: 'AI scans your expenses and flags everything deductible — equipment, software, your home office, that "business trip" to VidCon. We find it all.',
              },
              {
                n: "03 //",
                icon: "📅",
                t: "Quarterly reminders",
                d: "No more surprise tax bills. We calculate your quarterly estimates and remind you before the IRS starts adding interest. Fun stuff.",
              },
              {
                n: "04 //",
                icon: "🌐",
                t: "Multi-state support",
                d: "Moved states mid-year? Traveling streamer? Have subscribers in 47 states? We handle the multi-state stuff without charging you per state.",
              },
              {
                n: "05 //",
                icon: "💬",
                t: "Plain English, always",
                d: 'Every form. Every step. Explained like a human wrote it, not a lawyer billing by the word. We promise to never say "Schedule SE" without explaining what that means.',
              },
              {
                n: "06 //",
                icon: "🛡️",
                t: "Audit-proof filing",
                d: "We keep receipts organized, your deductions documented, and your filing clean. If you get audited, we've got your back. (You probably won't though.)",
              },
            ].map((f) => (
              <div
                key={f.n}
                className="p-8 sm:p-9 transition-colors hover:bg-white/[0.03]"
                style={{ background: "rgba(22,22,28,0.92)" }}
              >
                <p className="font-mono text-[11px] mb-5 tracking-[0.1em]" style={{ color: "#555555" }}>
                  {f.n}
                </p>
                <div
                  className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-xl mb-5 border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                  aria-hidden
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-lg tracking-tight text-fg mb-2.5">{f.t}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: "#777777" }}>
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Who */}
        <section id="who-its-for" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-green mb-4">// Who it&apos;s for</p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-5">
            If you get paid to
            <br />
            make stuff, <em className="text-green not-italic">hi.</em>
          </h2>
          <p className="text-[18px] max-w-[540px] mb-12 leading-relaxed" style={{ color: "#888888" }}>
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
              { e: "🏃", t: "Side Hustlers", d: "W-2 from your day job + 1099 from your real job. We merge them without the math spiral." },
              { e: "💰", t: "Crypto People", d: "NFT sales, staking income, airdrops. Yes, all of it. We're not judging, just filing." },
            ].map((w) => (
              <div
                key={w.t}
                className="rounded-[10px] border p-6 sm:p-7 transition-all hover:-translate-y-0.5 hover:border-green/40"
                style={{
                  background: "rgba(22,22,28,0.85)",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <span className="text-[28px] block mb-3.5" aria-hidden>
                  {w.e}
                </span>
                <h3 className="font-display font-bold text-base tracking-tight text-fg mb-1.5">{w.t}</h3>
                <p className="text-[13px] leading-snug" style={{ color: "#666666" }}>
                  {w.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-green mb-4">// Pricing</p>
          <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-5">
            We won&apos;t nickel
            <br />
            and <em className="text-green not-italic">dime you.</em>
          </h2>
          <p className="text-[18px] max-w-[540px] mb-12 leading-relaxed" style={{ color: "#888888" }}>
            Transparent pricing. No add-ons for the features you actually need. The IRS already charges you enough.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border p-8 sm:p-9 relative" style={{ background: "rgba(22,22,28,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] mb-3.5" style={{ color: "#888888" }}>
                // Starter
              </p>
              <p className="font-display font-extrabold text-5xl tracking-tight text-fg leading-none mb-1">$0</p>
              <p className="font-mono text-[14px] mb-7" style={{ color: "#555555" }}>
                forever, for real
              </p>
              <ul className="list-none m-0 p-0 mb-8 space-y-2">
                {["1 income source", "Basic deduction finder", "Federal filing included", "Plain English help docs"].map((li) => (
                  <li key={li} className="flex gap-2.5 text-[14px] py-1.5 border-b border-white/[0.06]" style={{ color: "#888888" }}>
                    <span className="text-green font-mono text-xs shrink-0 mt-0.5">→</span>
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                to="/start"
                className="block w-full text-center rounded-lg py-3 text-[15px] font-semibold font-sans border transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: "rgba(255,255,255,0.14)", color: "#EDEDED" }}
              >
                Start free
              </Link>
            </div>

            <div
              className="rounded-xl border p-8 sm:p-9 relative"
              style={{
                background: "rgba(30,30,38,0.95)",
                borderColor: "rgba(0,255,133,0.45)",
              }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[11px] font-medium px-3.5 py-1 rounded-full whitespace-nowrap tracking-wide"
                style={{ background: "#00FF85", color: "#04140e" }}
              >
                most popular
              </div>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] mb-3.5" style={{ color: "#888888" }}>
                // Creator
              </p>
              <p className="font-display font-extrabold text-5xl tracking-tight text-fg leading-none mb-1">$12</p>
              <p className="font-mono text-[14px] mb-7" style={{ color: "#555555" }}>
                /month — cancel anytime
              </p>
              <ul className="list-none m-0 p-0 mb-8 space-y-2">
                {[
                  "Unlimited income sources",
                  "AI deduction radar",
                  "Federal + state filing",
                  "Quarterly estimate reminders",
                  "Platform integrations",
                ].map((li) => (
                  <li key={li} className="flex gap-2.5 text-[14px] py-1.5 border-b border-white/[0.06]" style={{ color: "#888888" }}>
                    <span className="text-green font-mono text-xs shrink-0 mt-0.5">→</span>
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                to="/start"
                className="block w-full text-center rounded-lg py-3 text-[15px] font-semibold font-sans transition-colors border"
                style={{
                  background: "#00FF85",
                  color: "#04140e",
                  borderColor: "#00FF85",
                }}
              >
                Get the good one →
              </Link>
            </div>

            <div className="rounded-xl border p-8 sm:p-9 relative" style={{ background: "rgba(22,22,28,0.85)", borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] mb-3.5" style={{ color: "#888888" }}>
                // Pro
              </p>
              <p className="font-display font-extrabold text-5xl tracking-tight text-fg leading-none mb-1">$29</p>
              <p className="font-mono text-[14px] mb-7" style={{ color: "#555555" }}>
                /month
              </p>
              <ul className="list-none m-0 p-0 mb-8 space-y-2">
                {["Everything in Creator", "Audit support & docs", "Multi-state filing", "1:1 tax advisor access", "LLC & S-Corp support"].map((li) => (
                  <li key={li} className="flex gap-2.5 text-[14px] py-1.5 border-b border-white/[0.06]" style={{ color: "#888888" }}>
                    <span className="text-green font-mono text-xs shrink-0 mt-0.5">→</span>
                    {li}
                  </li>
                ))}
              </ul>
              <Link
                to="/start"
                className="block w-full text-center rounded-lg py-3 text-[15px] font-semibold font-sans border transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: "rgba(255,255,255,0.14)", color: "#EDEDED" }}
              >
                Go pro
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <div className="border-y" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(15,15,20,0.75)" }}>
          <div className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-green mb-4">// Real humans, real money</p>
            <h2 className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-12">
              They got their
              <br />
              money back. <em className="text-green not-italic">You can too.</em>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  quote:
                    '"Found $3,200 in deductions I completely missed last year. My accountant laughed when I told him. I didn\'t laugh because $3,200."',
                  avatar: "🎮",
                  name: "CryptoKev_IRL",
                  handle: "Twitch Affiliate · 12k followers",
                },
                {
                  quote:
                    '"I have income from YouTube, Etsy, Patreon, and one weird Fiverr gig I did once. GigaTax handled it all without a single panicked phone call."',
                  avatar: "🎨",
                  name: "Mara Illustration",
                  handle: "Artist · YouTube & Etsy seller",
                },
                {
                  quote:
                    '"I used to pay $400 to an accountant who still didn\'t understand what a brand deal was. GigaTax costs $12 and it gets it. I\'m not going back."',
                  avatar: "📱",
                  name: "Rae Does Things",
                  handle: "Lifestyle Creator · TikTok & IG",
                },
              ].map((t) => (
                <article
                  key={t.name}
                  className="rounded-[10px] border p-7"
                  style={{ background: "#0a0a0f", borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <p className="text-green text-sm tracking-widest mb-3.5" aria-label="5 stars">
                    ★★★★★
                  </p>
                  <p className="text-[15px] leading-relaxed mb-5 italic" style={{ color: "#a3a3a3" }}>
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                      aria-hidden
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-fg">{t.name}</p>
                      <p className="font-mono text-[12px]" style={{ color: "#555555" }}>
                        {t.handle}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section id="faq" className="px-5 sm:px-8 lg:px-10 py-20 sm:py-24 max-w-[1100px] mx-auto scroll-mt-28" aria-labelledby={faqHeadingId}>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-green mb-4">// FAQ</p>
          <h2 id={faqHeadingId} className="font-display font-extrabold text-[clamp(2rem,5vw,3.25rem)] tracking-[-0.04em] leading-tight text-fg mb-12">
            Questions you&apos;d Google
            <br />
            at <em className="text-green not-italic">midnight.</em>
          </h2>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {FAQ_ITEMS.map((item) => {
              const open = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(22,22,28,0.85)" }}
                >
                  <button
                    type="button"
                    id={`faq-${item.id}`}
                    className="w-full text-left px-6 sm:px-7 py-5 flex justify-between items-center gap-4 font-display font-bold text-[17px] tracking-tight text-fg transition-colors hover:bg-white/[0.04]"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${item.id}`}
                    onClick={() => toggleFaq(item.id)}
                  >
                    {item.q}
                    <span className={`text-green font-mono text-lg shrink-0 transition-transform ${open ? "rotate-45" : ""}`} aria-hidden>
                      +
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-${item.id}`}
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 sm:px-7 pb-6 text-[15px] leading-relaxed" style={{ color: "#777777" }}>
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="overflow-hidden">
          <section className="relative text-center px-5 sm:px-8 py-24 sm:py-28 max-w-[1100px] mx-auto">
            <div
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-extrabold text-[clamp(4rem,22vw,12.5rem)] whitespace-nowrap z-0 select-none"
              style={{
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.08)",
              }}
              aria-hidden
            >
              $$$
            </div>
            <div className="relative z-[1]">
              <h2 className="font-display font-extrabold text-[clamp(2.25rem,6vw,4.5rem)] tracking-[-0.05em] leading-tight text-fg mb-5">
                Ready to keep what
                <br />
                you <em className="text-green not-italic">actually earned?</em>
              </h2>
              <p className="text-[18px] max-w-[480px] mx-auto mb-10 leading-relaxed" style={{ color: "#777777" }}>
                Join 87,000+ gig workers who stopped guessing and started filing like they know what they&apos;re doing.
              </p>
              <Link
                to="/start"
                className="inline-flex items-center justify-center rounded-lg px-10 py-4 text-[18px] font-semibold font-sans transition-all hover:-translate-y-px"
                style={{
                  background: "#00FF85",
                  color: "#04140e",
                }}
              >
                Start for free — no card needed
              </Link>
              <p className="font-mono text-[13px] mt-4 tracking-wide" style={{ color: "#444444" }}>
                // more money, less problems
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer
        className="relative z-10 border-t px-5 sm:px-8 lg:px-10 py-10 max-w-[1100px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(5,5,8,0.6)" }}
      >
        <GigaTaxWordmark size="sm" className="shrink-0" />
        <p className="font-mono text-[12px] order-last sm:order-none" style={{ color: "#555555" }}>
          // taxes for the gig economy · {TAX_YEAR}
        </p>
        <div className="flex flex-wrap gap-6 font-mono text-[12px]" style={{ color: "#555555" }}>
          <a href="#" className="hover:text-fg-muted transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-fg-muted transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-fg-muted transition-colors">
            Security
          </a>
          <a href="#" className="hover:text-fg-muted transition-colors">
            Blog
          </a>
        </div>
      </footer>
    </div>
  );
}
