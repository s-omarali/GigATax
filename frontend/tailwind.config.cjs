/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#090b11",
          900: "#0f1220",
          850: "#13172a"
        },
        neon: {
          mint: "#50e3a4",
          cyan: "#2ac3ff",
          coral: "#ff7a59",
          amber: "#ffbf47"
        }
      },
      boxShadow: {
        bento: "0 0 0 1px rgba(255,255,255,0.08), 0 16px 38px rgba(6,11,33,0.4)",
        glow: "0 0 0 1px rgba(80,227,164,0.3), 0 0 32px rgba(80,227,164,0.12)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        rise: "rise 420ms ease-out both"
      }
    }
  },
  plugins: []
};
