import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GigaTaxWordmark } from "../components/branding/GigaTaxWordmark";
import { joinWaitlist, verifyAccessCode } from "../services/api";

const surfaceClass =
  "rounded-xl border border-white/[0.06] ring-1 ring-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.28)]";

const inputClass =
  "giga-input rounded-lg border border-white/[0.12] bg-white/[0.03] font-sans text-[15px] text-fg placeholder:text-fg-faint focus:border-blue/45 focus:ring-0 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]";

export function WaitlistAccessPage() {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<number | null>(null);
  const redirectIntervalRef = useRef<number | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [authorizedPassword, setAuthorizedPassword] = useState("");
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [accessError, setAccessError] = useState("");
  const hasWaitlistEmail = waitlistEmail.trim().length > 0;
  const hasAuthorizedPassword = authorizedPassword.trim().length > 0;

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
      if (redirectIntervalRef.current !== null) {
        window.clearInterval(redirectIntervalRef.current);
      }
    };
  }, []);

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (waitlistSubmitted || !hasWaitlistEmail) {
      return;
    }

    try {
      await joinWaitlist(waitlistEmail);
    } catch {
      // fail silently — UX still shows success
    }

    if (redirectTimeoutRef.current !== null) {
      window.clearTimeout(redirectTimeoutRef.current);
    }
    if (redirectIntervalRef.current !== null) {
      window.clearInterval(redirectIntervalRef.current);
    }

    setWaitlistSubmitted(true);
    setRedirectCountdown(5);

    redirectIntervalRef.current = window.setInterval(() => {
      setRedirectCountdown((currentValue) => Math.max(0, currentValue - 1));
    }, 1000);

    redirectTimeoutRef.current = window.setTimeout(() => {
      if (redirectIntervalRef.current !== null) {
        window.clearInterval(redirectIntervalRef.current);
      }
      window.location.replace("/");
    }, 5000);
  }

  async function handleAuthorizedSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasAuthorizedPassword) {
      return;
    }
    setAccessError("");
    const ok = await verifyAccessCode(authorizedPassword);
    if (!ok) {
      setAccessError("Invalid access code");
      return;
    }
    sessionStorage.setItem("access_granted", "true");
    navigate("/start");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-fg">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div
          className="landing-orb landing-orb--a absolute -top-40 left-1/2 h-[620px] w-[840px] -translate-x-1/2 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,255,133,0.2) 0%, rgba(0,255,133,0.04) 42%, rgba(0,255,133,0) 74%)",
          }}
        />
        <div
          className="landing-orb landing-orb--b absolute -bottom-10 right-[-5%] h-[560px] w-[680px] rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(circle at center, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.05) 46%, rgba(59,130,246,0) 76%)",
          }}
        />
      </div>
      <div className="landing-vignette" aria-hidden />
      <div className="landing-grain" aria-hidden />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1100px] flex-col px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-10">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center rounded-lg focus-visible:outline-offset-4">
            <GigaTaxWordmark size="lg" className="leading-none" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] px-4 py-2 font-sans text-[14px] font-semibold text-fg transition-all duration-200 hover:border-white/[0.2] hover:bg-white/[0.05]"
          >
            Return
          </Link>
        </header>

        <section className={`mx-auto w-full max-w-[720px] ${surfaceClass} px-6 py-7 sm:px-8 sm:py-9`}>
          <p className="mb-4 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-green">// Early access</p>
          <h1 className="mb-5 max-w-[24ch] font-display text-[clamp(2rem,5vw,3rem)] font-extrabold leading-tight tracking-[-0.04em] text-fg">
            Join the waitlist to be the first to gain access to GigATax
          </h1>

          <form className="space-y-4" onSubmit={handleWaitlistSubmit}>
            {!waitlistSubmitted && (
              <label className="block">
                <span className="mb-2 block font-mono text-[11px] tracking-[0.08em] text-fg-faint">Email</span>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="you@domain.com"
                  required
                  value={waitlistEmail}
                  onChange={(event) => setWaitlistEmail(event.target.value)}
                />
              </label>
            )}
            <button
              type="submit"
              disabled={waitlistSubmitted || (!waitlistSubmitted && !hasWaitlistEmail)}
              className={`inline-flex w-full items-center justify-center rounded-lg border px-6 py-3 text-[15px] font-semibold transition-all duration-200 active:scale-[0.99] ${
                waitlistSubmitted
                  ? "border-[#99ffd1] bg-[#5cffb0] text-[#03150d] shadow-[0_0_0_1px_rgba(92,255,176,0.55),0_0_22px_rgba(92,255,176,0.4)]"
                  : "border-green bg-green text-[#04140e] hover:opacity-95 hover:shadow-[0_0_0_1px_rgba(0,255,133,0.45),0_8px_24px_rgba(0,255,133,0.22)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-none"
              }`}
            >
              {waitlistSubmitted
                ? "Congrats. You just did the hardest tax thing you'll ever do. You're on the list!"
                : "Join waitlist"}
            </button>
            {waitlistSubmitted && (
              <p className="pt-1 font-sans text-[13px] leading-relaxed text-fg-muted">
                redirecting you to the home page in {redirectCountdown}...
              </p>
            )}
          </form>

          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" aria-hidden />

          <section className={`mx-auto max-w-[560px] rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 text-center sm:p-6`}>
            <h2 className="mb-2 font-display text-[1.35rem] font-bold tracking-[-0.02em] text-fg">Authorized access</h2>
            <form className="space-y-3" onSubmit={handleAuthorizedSubmit}>
              <label className="block">
                <span className="mb-2 block font-mono text-[10px] tracking-[0.08em] text-fg-faint">Password</span>
                <input
                  className={`${inputClass} py-2.5 text-[14px]`}
                  type="password"
                  placeholder="Access password"
                  value={authorizedPassword}
                  onChange={(event) => setAuthorizedPassword(event.target.value)}
                />
              </label>
              {accessError && (
                <p className="font-sans text-[13px] text-red-400">{accessError}</p>
              )}
              <button
                type="submit"
                disabled={!hasAuthorizedPassword}
                className="inline-flex items-center justify-center rounded-lg border border-white/[0.16] px-4 py-2.5 font-sans text-[14px] font-semibold text-fg transition-all duration-200 hover:border-white/[0.24] hover:bg-white/[0.06] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Continue to onboarding
              </button>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
