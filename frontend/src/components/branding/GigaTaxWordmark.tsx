import type { CSSProperties } from "react";

const SIZE_PX: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl", number> = {
  xs: 12,
  sm: 17,
  md: 21,
  lg: 26,
  xl: 32,
  "2xl": 42,
};

const TONE_COLOR: Record<"neon" | "onAccent" | "subtle", string> = {
  neon: "#1AFF8C",
  onAccent: "#0a0a0f",
  subtle: "rgba(26, 255, 140, 0.55)",
};

export type GigaTaxWordmarkProps = {
  className?: string;
  /** Visual scale — lockup stays the same proportions. */
  size?: keyof typeof SIZE_PX;
  /** `neon` matches the brand plate; `onAccent` for green CTA buttons; `subtle` for muted footers. */
  tone?: keyof typeof TONE_COLOR;
};

/**
 * Typography wordmark: GIGATAX in heavy italic sans (Montserrat 900 italic), tight kerning, neon mint.
 */
export function GigaTaxWordmark({
  className = "",
  size = "md",
  tone = "neon",
}: GigaTaxWordmarkProps) {
  const px = SIZE_PX[size];
  const color = TONE_COLOR[tone];

  const face: CSSProperties = {
    fontFamily: '"Montserrat", "Inter", system-ui, sans-serif',
    fontWeight: 900,
    fontStyle: "italic",
    letterSpacing: "-0.05em",
    textTransform: "uppercase",
    color,
    fontSize: px,
    lineHeight: 1,
    ...(tone === "neon"
      ? {
          textShadow:
            "0 0 22px rgba(26, 255, 140, 0.65), 0 0 48px rgba(26, 255, 140, 0.28)",
        }
      : {}),
  };

  return (
    <span className={`inline-flex items-baseline ${className}`.trim()}>
      <span className="sr-only">GigATax</span>
      <span aria-hidden className="whitespace-nowrap" style={face}>
        GIGATAX
      </span>
    </span>
  );
}
