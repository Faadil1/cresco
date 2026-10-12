// CRESCO Warm Editorial illustration palette: grounded in the shared CSS tokens.
// Character art is illustrative, never a representation of a real customer.
export const P = {
  ink: "#10253d",
  ink2: "#425267",
  ink3: "#819087",
  line: "#ddd6c7",
  fog: "#fbf8f1",
  surface: "#fffdfa",
  white: "#ffffff",
  blue: "#315e86",
  blueSoft: "#e7eff5",
  blueMid: "#8eabc1",
  sage: "#367d56",
  sageSoft: "#e7f0df",
  ochre: "#d8a14f",
  ochreSoft: "#fff2d9",
  clay: "#dd895c",
  claySoft: "#f9e9dc",
} as const;
export const STROKE = { stroke: P.ink, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
export function a11y(title?: string) {
  return title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
}
