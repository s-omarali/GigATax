/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base surfaces
        surface: {
          base:     "#050505",
          card:     "rgba(255,255,255,0.03)",
          elevated: "rgba(255,255,255,0.06)",
          deep:     "#0a0a0a",
        },
        // Borders
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          subtle:  "rgba(255,255,255,0.05)",
          hover:   "rgba(255,255,255,0.14)",
          blue:    "rgba(59,130,246,0.35)",
          green:   "rgba(0,255,133,0.35)",
          amber:   "rgba(245,158,11,0.35)",
        },
        // Primary accents
        green: {
          DEFAULT: "#00FF85",
          dim:     "rgba(0,255,133,0.12)",
          glow:    "rgba(0,255,133,0.08)",
          muted:   "rgba(0,255,133,0.6)",
        },
        blue: {
          DEFAULT: "#3B82F6",
          dim:     "rgba(59,130,246,0.12)",
          glow:    "rgba(59,130,246,0.08)",
          muted:   "rgba(59,130,246,0.6)",
        },
        amber: {
          DEFAULT: "#F59E0B",
          dim:     "rgba(245,158,11,0.12)",
          glow:    "rgba(245,158,11,0.08)",
        },
        red: {
          DEFAULT: "#EF4444",
          dim:     "rgba(239,68,68,0.12)",
        },
        // Foreground scale
        fg: {
          DEFAULT: "#EDEDED",
          muted:   "#888888",
          faint:   "#555555",
        },
      },
      fontFamily: {
        sans:    ["'Inter'", "'Segoe UI'", "system-ui", "sans-serif"],
        mono:    ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "monospace"],
        display: ["'Syne'", "'Inter'", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        // Card shells
        bento:       "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.7)",
        "bento-hover":"0 0 0 1px rgba(255,255,255,0.14), 0 12px 40px rgba(0,0,0,0.8)",
        // Accent glows
        "glow-green": "0 0 0 1px rgba(0,255,133,0.3), 0 0 40px rgba(0,255,133,0.15), inset 0 1px 0 rgba(0,255,133,0.1)",
        "glow-blue":  "0 0 0 1px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.15), inset 0 1px 0 rgba(59,130,246,0.1)",
        "glow-amber": "0 0 0 1px rgba(245,158,11,0.3), 0 0 32px rgba(245,158,11,0.12)",
        // Glass edge highlight
        "glass-inset": "inset 0 1px 0 rgba(255,255,255,0.07)",
      },
      borderRadius: {
        bento: "16px",
        inner: "12px",
        sm:    "8px",
        full:  "9999px",
      },
      backdropBlur: {
        xs: "4px",
      },
      keyframes: {
        rise: {
          "0%":   { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-green": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 8px rgba(0,255,133,0.6)" },
          "50%":       { opacity: "0.6", boxShadow: "0 0 18px rgba(0,255,133,0.9)" },
        },
        ticker: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "landing-marquee": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        rise:          "rise 380ms cubic-bezier(0.16,1,0.3,1) both",
        "pulse-green": "pulse-green 2.4s ease-in-out infinite",
        ticker:        "ticker 300ms ease-out both",
        "landing-marquee": "landing-marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};
