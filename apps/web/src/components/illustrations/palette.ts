// Fog & Ink Blue illustration palette. Flat shapes, one fine ink line,
// one accent per picture. Mirrors the tokens in app/globals.css.
export const P = {
  ink: "#14171c",
  ink2: "#4a515c",
  ink3: "#8a929d",
  line: "#cfd5dc",
  fog: "#e8ebee",
  surface: "#f5f6f8",
  white: "#ffffff",
  blue: "#1f3bcc",
  blueSoft: "#dfe4f8",
  blueMid: "#9aa8ea",
  sage: "#2f7d5b",
  sageSoft: "#dcebe3",
  ochre: "#c99a3c",
  ochreSoft: "#f2e8d3",
  clay: "#c4674a",
  claySoft: "#f3e0d8",
} as const;

export const STROKE = { stroke: P.ink, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

export function a11y(title?: string) {
  return title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
}
