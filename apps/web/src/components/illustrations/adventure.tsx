/**
 * "Grow your money skills" (issue #135): original vector illustrations for the
 * approved illustrated adventure art direction. Drawn for Cresco; no third-party
 * assets, no real people, no trackers. Decorative pieces are hidden from
 * assistive technology; the goal jar carries a real text alternative.
 *
 * Depth comes from soft gradient lighting (light from the upper right), a
 * light face and a shadow face on every mountain, two-tone foliage, atmospheric
 * haze between layers and small details (flowers, pebbles, ripples, birds).
 * Gradient ids are made unique per instance with useId.
 */
import { useId } from "react";
import { a11y } from "./palette";

/** Adventure palette (kept beside the CSS tokens in globals.css). */
export const A = {
  ink: "#102d36",
  forest: "#147b56",
  forestDeep: "#0d5c40",
  leaf: "#2f9e6b",
  meadow: "#7fd09f",
  meadowLight: "#b7e8c6",
  mint: "#ddf5e8",
  ivory: "#fff9ec",
  sand: "#f6e3b8",
  sandEdge: "#e3c78d",
  violet: "#5936c7",
  violetMid: "#7a5ce0",
  lavender: "#b9a8f0",
  lavenderSoft: "#eee8fc",
  sky: "#dcebfa",
  skyMid: "#a9cdf0",
  water: "#7fbde6",
  amber: "#f6c76a",
  amberDeep: "#d99a2b",
  coral: "#ef8a5a",
  coralDeep: "#cf6a3c",
  skin: "#f3c6a0",
  skinShade: "#e0a57e",
  hair: "#5a3824",
  hairLight: "#80553a",
  wood: "#a8744a",
  woodDark: "#7c5232",
  rock: "#a99ad8",
  rockShade: "#7f6fc2",
  snow: "#ffffff",
} as const;

type ArtProps = { className?: string; title?: string };

/** Unique, CSS-safe id prefix for gradients inside one SVG instance. */
function useUid() {
  return "a" + useId().replace(/[^a-zA-Z0-9]/g, "");
}

/** A pine with a lit side and a shadow side on each tier. */
function Pine({ x, y, s = 1, dark = false }: { x: number; y: number; s?: number; dark?: boolean }) {
  const lit = dark ? "#1d7a55" : "#2a9466";
  const shade = dark ? "#0b5139" : "#11704c";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="2" cy="7" rx="13" ry="3" fill="#0b3b2b" opacity=".18"/>
      <rect x="-2.2" y="-3" width="4.4" height="10" rx="1.4" fill={A.woodDark}/>
      {[[-44, -26, 11], [-32, -13, 14], [-20, 0, 17]].map(([top, base, w]) => (
        <g key={top}>
          <path d={`M0 ${top} L${w} ${base} H-${w} Z`} fill={shade}/>
          <path d={`M0 ${top} L-${w} ${base} H${w * 0.15} Z`} fill={lit}/>
          <path d={`M-1 ${top + 5} L-${w * 0.55} ${base - 3}`} stroke="#7fd09f" strokeOpacity=".45" strokeWidth="1.2" strokeLinecap="round"/>
        </g>
      ))}
    </g>
  );
}

/** A round broadleaf tree: three canopy masses, a rim light and a ground shadow. */
function RoundTree({ x, y, s = 1, tone = "green" }: { x: number; y: number; s?: number; tone?: "green" | "autumn" }) {
  const [lit, mid, shade] = tone === "autumn" ? ["#f4b860", "#e59a45", "#c27632"] : ["#6fcf94", "#36a86e", "#1b7f52"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="3" cy="8" rx="17" ry="3.5" fill="#0b3b2b" opacity=".18"/>
      <path d="M-2.5 8 V-8 M0 -2 L5 -9" stroke={A.woodDark} strokeWidth="4.5" strokeLinecap="round"/>
      <circle cx="-7" cy="-16" r="11" fill={shade}/>
      <circle cx="7" cy="-15" r="11" fill={shade}/>
      <circle cx="0" cy="-24" r="14" fill={mid}/>
      <circle cx="-6" cy="-18" r="10" fill={mid}/>
      <circle cx="4" cy="-28" r="8" fill={lit}/>
      <circle cx="8" cy="-21" r="5" fill={lit} opacity=".8"/>
      <circle cx="-9" cy="-14" r="1.4" fill="#fff" opacity=".35"/>
    </g>
  );
}

function Bush({ x, y, s = 1, berries = false }: { x: number; y: number; s?: number; berries?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="16" ry="3" fill="#0b3b2b" opacity=".15"/>
      <circle cx="-8" cy="-4" r="7" fill="#1f8a5c"/><circle cx="7" cy="-4" r="7.5" fill="#1f8a5c"/>
      <circle cx="0" cy="-8" r="9" fill="#38ab70"/><circle cx="3" cy="-11" r="4.5" fill="#6fcf94"/>
      {berries ? <g fill={A.coral}><circle cx="-6" cy="-6" r="1.6"/><circle cx="5" cy="-3" r="1.6"/><circle cx="1" cy="-12" r="1.4"/></g> : null}
    </g>
  );
}

function Rock({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-12 0 Q-12 -9 -3 -11 Q8 -12 12 -3 Q13 0 12 0 Z" fill="#9c95b8"/>
      <path d="M-3 -11 Q8 -12 12 -3 Q13 0 12 0 H2 Q4 -6 -3 -11 Z" fill="#7d7699"/>
      <path d="M-8 -6 Q-5 -9 -1 -9" stroke="#fff" strokeOpacity=".5" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </g>
  );
}

function Flowers({ points }: { points: readonly (readonly [number, number, string])[] }) {
  return (
    <g>
      {points.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 v6" stroke="#1f8a5c" strokeWidth="1.2"/>
          <circle cx="-1.6" cy="-0.6" r="1.7" fill={c}/><circle cx="1.6" cy="-0.6" r="1.7" fill={c}/>
          <circle cx="0" cy="-2.2" r="1.7" fill={c}/><circle cx="0" cy="0.9" r="1.7" fill={c}/>
          <circle cx="0" cy="-0.6" r="1" fill="#fff3c4"/>
        </g>
      ))}
    </g>
  );
}

function GrassTufts({ points, color = "#2f9e6b" }: { points: readonly (readonly [number, number])[]; color?: string }) {
  return (
    <g stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".75">
      {points.map(([x, y], i) => <path key={i} d={`M${x} ${y} l-2 -6 M${x + 2} ${y} l0 -8 M${x + 4} ${y} l2 -6`}/>)}
    </g>
  );
}

function Cloud({ x, y, s = 1, opacity = 0.9 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx="0" cy="6" rx="34" ry="7" fill="#d8cdf7" opacity=".5"/>
      <ellipse cx="-14" cy="0" rx="16" ry="10" fill="#fff"/><ellipse cx="6" cy="-5" rx="18" ry="13" fill="#fff"/>
      <ellipse cx="22" cy="1" rx="13" ry="8" fill="#fff"/><ellipse cx="0" cy="3" rx="30" ry="7" fill="#fff"/>
    </g>
  );
}

function Birds({ x, y, color = "#fff" }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".85">
      <path d="M0 0 q4 -4 8 0 q4 -4 8 0"/><path d="M18 -10 q3 -3 6 0 q3 -3 6 0"/><path d="M-12 -14 q2.5 -2.5 5 0 q2.5 -2.5 5 0"/>
    </g>
  );
}

/**
 * The young explorer: age-neutral, curious and cheerful, with a well-used
 * backpack and a rolled blanket for the journey, one hand waving.
 */
export function ExplorerKid({ className, title, ground = false }: ArtProps & { ground?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 120 200" overflow="visible" className={className} {...a11y(title)}>
      <defs>
        <linearGradient id={`${u}-shirt`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#3fb57a"/><stop offset="1" stopColor="#1d8457"/></linearGradient>
        <linearGradient id={`${u}-pack`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#f6a06c"/><stop offset="1" stopColor="#d9693a"/></linearGradient>
        <radialGradient id={`${u}-face`} cx=".42" cy=".38" r=".7"><stop offset="0" stopColor="#fbd6b6"/><stop offset="1" stopColor={A.skin}/></radialGradient>
        <linearGradient id={`${u}-pants`} x1="0" x2="1"><stop offset="0" stopColor="#2b4f5c"/><stop offset="1" stopColor="#16323c"/></linearGradient>
      </defs>
      {ground ? (
        <g>
          <path d="M-30 206 Q-20 184 20 186 Q62 176 104 186 Q144 186 152 206 Z" fill="#4fb37f"/>
          <path d="M-30 206 Q-20 184 20 186 Q62 176 104 186 Q144 186 152 206" fill="none" stroke="#a8e6bf" strokeWidth="2.5"/>
          <path d="M-6 194 l-2 -6 M-3 194 v-8 M128 194 l2 -6 M131 194 v-8" stroke="#1f8a5c" strokeWidth="1.6" strokeLinecap="round"/>
          <g transform="translate(6 190)"><circle r="2.2" fill="#fff"/><circle r="1" fill={A.amber}/></g>
          <g transform="translate(118 192)"><circle r="2.2" fill={A.amber}/><circle r="1" fill="#fff"/></g>
        </g>
      ) : null}
      <ellipse cx="62" cy="190" rx="34" ry="5" fill="#0b2a22" opacity=".25"/>
      {/* rolled blanket and backpack */}
      <rect x="16" y="62" width="42" height="12" rx="6" fill="#7a5ce0"/>
      <path d="M22 62 v12 M30 62 v12 M50 62 v12" stroke="#5936c7" strokeWidth="1.5"/>
      <rect x="20" y="70" width="38" height="56" rx="13" fill={`url(#${u}-pack)`}/>
      <path d="M20 96 q19 6 38 0 v18 q0 12 -13 12 h-12 q-13 0 -13 -12 z" fill={A.coralDeep} opacity=".55"/>
      <rect x="27" y="100" width="22" height="15" rx="5" fill="#f7b489" stroke={A.coralDeep} strokeWidth="1.5"/>
      <rect x="35" y="97" width="6" height="7" rx="2" fill={A.amber} stroke={A.amberDeep} strokeWidth="1"/>
      <path d="M26 76 q4 -5 10 -5" stroke="#fff" strokeOpacity=".5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* legs, socks and boots */}
      <path d="M51 140 L47 178" stroke={`url(#${u}-pants)`} strokeWidth="12" strokeLinecap="round"/>
      <path d="M68 140 L74 178" stroke={`url(#${u}-pants)`} strokeWidth="12" strokeLinecap="round"/>
      <rect x="41" y="172" width="12" height="7" rx="2" fill="#fff9ec"/><rect x="68" y="172" width="12" height="7" rx="2" fill="#fff9ec"/>
      <path d="M36 190 q1 -11 11 -11 h7 q4 0 4 5 v6 z" fill={A.violet}/>
      <path d="M36 190 h22 v-3 h-22 z" fill="#3a2391"/>
      <path d="M67 190 v-6 q0 -5 4 -5 h7 q11 0 12 11 z" fill={A.violet}/>
      <path d="M67 190 h23 v-3 h-23 z" fill="#3a2391"/>
      <path d="M44 182 l6 0 M72 182 l6 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
      {/* shorts */}
      <path d="M41 126 h38 l4 22 h-18 l-4 -9 -4 9 h-20z" fill={`url(#${u}-pants)`}/>
      <path d="M61 130 v8" stroke="#0e2128" strokeWidth="1.4"/>
      {/* body: t-shirt with a rolled sleeve, strap and a little leaf badge */}
      <path d="M38 88 q22 -14 44 0 l2 42 h-48z" fill={`url(#${u}-shirt)`}/>
      <path d="M62 82 q12 2 20 6 l2 42 h-18z" fill="#0d5c40" opacity=".28"/>
      <path d="M44 86 l7 44" stroke={A.coralDeep} strokeWidth="5.5" strokeLinecap="round"/>
      <path d="M44 86 l7 44" stroke="#f6a06c" strokeWidth="2" strokeLinecap="round" opacity=".6"/>
      <path d="M68 100 q4 -6 8 0 q-4 6 -8 0z" fill={A.amber}/>
      <path d="M50 84 q10 7 20 0" stroke="#1d8457" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* waving arm */}
      <path d="M78 92 q15 -6 19 -27" stroke={`url(#${u}-shirt)`} strokeWidth="12" strokeLinecap="round" fill="none"/>
      <path d="M90 76 l9 3" stroke="#1d8457" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="98" cy="60" r="7.5" fill={`url(#${u}-face)`}/>
      <path d="M93 55 l-2 -5 M97 53 l0 -5 M101 54 l2 -4" stroke={A.skinShade} strokeWidth="3.5" strokeLinecap="round"/>
      {/* other arm resting on the strap */}
      <path d="M41 94 q-7 18 -2 32" stroke={`url(#${u}-shirt)`} strokeWidth="11" strokeLinecap="round" fill="none"/>
      <circle cx="40" cy="128" r="6.5" fill={A.skin}/>
      {/* neck, head, ears */}
      <rect x="54" y="68" width="12" height="14" rx="5" fill={A.skinShade}/>
      <ellipse cx="60" cy="50" rx="21" ry="22" fill={`url(#${u}-face)`}/>
      <ellipse cx="40" cy="53" rx="4.5" ry="6" fill={A.skinShade}/>
      <ellipse cx="80" cy="53" rx="4.5" ry="6" fill={A.skin}/>
      {/* hair: layered tufts with a highlight */}
      <path d="M37 50 q-3 -28 23 -30 q25 -1 24 26 q-5 -9 -14 -12 q2 6 -5 9 q-1 -6 -6 -9 q-4 8 -14 9 q-5 1 -8 7z" fill={A.hair}/>
      <path d="M50 20 q-4 -6 3 -9 q0 5 4 7z" fill={A.hair}/>
      <path d="M52 24 q10 -6 20 -1" stroke={A.hairLight} strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* face: brows, big eyes with catch-lights, nose, freckles, open smile */}
      <path d="M47 44 q4 -3 8 -1 M65 43 q4 -2 8 1" stroke={A.hair} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <ellipse cx="52" cy="52" rx="3.6" ry="4.4" fill={A.ink}/><ellipse cx="69" cy="52" rx="3.6" ry="4.4" fill={A.ink}/>
      <circle cx="53.3" cy="50.4" r="1.4" fill="#fff"/><circle cx="70.3" cy="50.4" r="1.4" fill="#fff"/>
      <path d="M60 55 q2 3 0 5" stroke={A.skinShade} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="46" cy="60" r="4.2" fill={A.coral} opacity=".3"/><circle cx="75" cy="60" r="4.2" fill={A.coral} opacity=".3"/>
      <g fill="#c98a62" opacity=".7"><circle cx="45" cy="57" r=".8"/><circle cx="48" cy="58.5" r=".8"/><circle cx="73" cy="57" r=".8"/><circle cx="76" cy="58.5" r=".8"/></g>
      <path d="M53 62 q7 8 14 0 q-7 3 -14 0z" fill="#8a3d2a"/>
      <path d="M56 64.5 q4 2 8 0" stroke="#e57f6a" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/**
 * The Home landscape: lit lavender peaks, a flag at the summit, a lake,
 * layered forest hills, flowers and a sandy trail. Sits in the lower/right
 * part of a violet hero card.
 */
export function MountainScene({ className, title, explorer = true }: ArtProps & { explorer?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 640 320" preserveAspectRatio="xMaxYMax slice" overflow="visible" className={className} {...a11y(title)}>
      <defs>
        <radialGradient id={`${u}-sun`}><stop offset="0" stopColor="#fff4cf"/><stop offset=".55" stopColor="#ffe09a"/><stop offset="1" stopColor="#ffd27a"/></radialGradient>
        <radialGradient id={`${u}-glow`}><stop offset="0" stopColor="#ffe3a3" stopOpacity=".55"/><stop offset="1" stopColor="#ffe3a3" stopOpacity="0"/></radialGradient>
        <linearGradient id={`${u}-far`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d3c8f8"/><stop offset="1" stopColor="#a796e6"/></linearGradient>
        <linearGradient id={`${u}-lit`} x1="1" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c9bdf6"/><stop offset="1" stopColor="#8d7bd8"/></linearGradient>
        <linearGradient id={`${u}-shade`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#7c6ac9"/><stop offset="1" stopColor="#5a48ad"/></linearGradient>
        <linearGradient id={`${u}-haze`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#efeafd" stopOpacity="0"/><stop offset="1" stopColor="#efeafd" stopOpacity=".7"/></linearGradient>
        <linearGradient id={`${u}-h1`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a8e6bf"/><stop offset="1" stopColor="#5cba86"/></linearGradient>
        <linearGradient id={`${u}-h2`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6cc792"/><stop offset="1" stopColor="#2f9467"/></linearGradient>
        <linearGradient id={`${u}-h3`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3aa271"/><stop offset="1" stopColor="#147b56"/></linearGradient>
        <linearGradient id={`${u}-lake`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#cfe8fb"/><stop offset="1" stopColor="#7fbde6"/></linearGradient>
        <linearGradient id={`${u}-path`} x1="0" x2="1"><stop offset="0" stopColor="#fbeccb"/><stop offset="1" stopColor="#f2dcaa"/></linearGradient>
      </defs>
      {/* sun, glow and sky life */}
      <circle cx="560" cy="64" r="90" fill={`url(#${u}-glow)`}/>
      <circle cx="560" cy="64" r="30" fill={`url(#${u}-sun)`}/>
      <circle cx="551" cy="55" r="9" fill="#fff" opacity=".35"/>
      <Cloud x={430} y={70} s={.9}/><Cloud x={250} y={44} s={.6} opacity={.7}/><Cloud x={610} y={130} s={.55} opacity={.6}/>
      <Birds x={350} y={96}/>
      {/* far range */}
      <path d="M160 236 L268 118 L318 168 L372 102 L430 156 L470 120 L560 210 L640 140 V270 H160 Z" fill={`url(#${u}-far)`}/>
      <path d="M268 118 L286 138 L276 136 L268 146 L258 134 Z M372 102 L390 122 L380 120 L372 130 L362 118 Z" fill="#fff" opacity=".85"/>
      <path d="M372 102 L430 156 L410 170 L380 130 Z M268 118 L318 168 L296 176 Z" fill="#8e7cd6" opacity=".35"/>
      <rect x="-200" y="176" width="1040" height="96" fill={`url(#${u}-haze)`}/>
      {/* main peak: lit face, shadow face, ridges, snow and the goal flag */}
      <path d="M318 256 L480 100 L612 256 Z" fill={`url(#${u}-lit)`}/>
      <path d="M480 100 L612 256 H528 L506 196 L494 150 Z" fill={`url(#${u}-shade)`}/>
      <path d="M480 100 L452 170 M452 170 L430 230 M494 150 L470 214" stroke="#fff" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round"/>
      <path d="M480 100 L510 130 L500 128 L492 140 L482 130 L472 142 L462 134 L452 136 Z" fill="#fff"/>
      <path d="M480 100 L510 130 L500 128 L492 140 L486 120 Z" fill="#dcd3fb"/>
      <path d="M481 101 V58" stroke={A.ink} strokeWidth="3" strokeLinecap="round"/>
      <path d="M482 59 q12 -4 18 2 q8 6 16 2 q-6 8 -16 5 q-8 -3 -18 2 Z" fill={A.amber}/>
      <path d="M482 59 q12 -4 18 2 q8 6 16 2 q-2 2 -4 3 q-6 0 -12 -3 q-8 -3 -18 2z" fill="#ffe3a3"/>
      {/* second, nearer peak on the left */}
      <path d="M200 262 L290 174 L370 262 Z" fill={`url(#${u}-lit)`} opacity=".9"/>
      <path d="M290 174 L370 262 H320 L302 210 Z" fill={`url(#${u}-shade)`} opacity=".9"/>
      <path d="M290 174 L304 190 L296 189 L289 197 L281 189 Z" fill="#fff"/>
      {/* hills and lake */}
      <path d="M0 250 Q120 206 250 234 T520 226 T640 214 V320 H0 Z" fill={`url(#${u}-h1)`}/>
      <path d="M0 250 Q120 206 250 234 T520 226 T640 214" fill="none" stroke="#d6f5e1" strokeOpacity=".8" strokeWidth="2"/>
      <ellipse cx="520" cy="258" rx="58" ry="10" fill={`url(#${u}-lake)`}/>
      <path d="M490 256 h22 M528 260 h18 M500 263 h12" stroke="#fff" strokeOpacity=".8" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M0 282 Q160 238 330 270 T640 254 V320 H0 Z" fill={`url(#${u}-h2)`}/>
      <path d="M0 282 Q160 238 330 270 T640 254" fill="none" stroke="#a8e6bf" strokeOpacity=".7" strokeWidth="2"/>
      <path d="M0 302 Q200 278 420 298 T640 288 V320 H0 Z" fill={`url(#${u}-h3)`}/>
      {/* the trail: soft edge, sandy surface and pebbles */}
      <path d="M210 324 C232 292 300 294 330 276 S392 248 422 242 S470 230 488 216" fill="none" stroke="#e3c78d" strokeWidth="16" strokeLinecap="round"/>
      <path d="M210 324 C232 292 300 294 330 276 S392 248 422 242 S470 230 488 216" fill="none" stroke={`url(#${u}-path)`} strokeWidth="11" strokeLinecap="round"/>
      <g fill="#d8b878"><ellipse cx="262" cy="298" rx="2.4" ry="1.4"/><ellipse cx="318" cy="281" rx="2" ry="1.2"/><ellipse cx="372" cy="256" rx="2" ry="1.2"/><ellipse cx="440" cy="236" rx="1.8" ry="1"/></g>
      {/* trees, bushes, rocks and flowers */}
      <Pine x={566} y={284} s={1.25}/><Pine x={594} y={278} s={1} dark/><Pine x={620} y={292} s={1.35}/>
      <Pine x={148} y={262} s={.8} dark/><Pine x={170} y={270} s={.95}/><Pine x={128} y={274} s={.7}/>
      <RoundTree x={392} y={290} s={.95}/><RoundTree x={540} y={302} s={.7} tone="autumn"/>
      <Bush x={300} y={300} s={.9} berries/><Bush x={462} y={286} s={.75}/>
      <Rock x={350} y={292} s={.9}/><Rock x={232} y={306} s={.7}/>
      <Flowers points={[[270, 312, "#fff"], [286, 306, A.amber], [410, 304, "#fff"], [428, 298, A.lavender], [500, 304, A.amber], [180, 300, "#fff"], [620, 312, A.amber]]}/>
      <GrassTufts points={[[240, 316], [360, 310], [452, 306], [600, 316], [120, 306]]} color="#0d5c40"/>
      {explorer ? <g transform="translate(250 196) scale(.62)"><ExplorerKid/></g> : null}
    </svg>
  );
}

export type ChapterScene = "meadow" | "town" | "peaks";

/**
 * Tall chapter landscapes behind the Learn trail. Anchored to the top
 * (xMidYMin slice) so each chapter's landmark is always visible: a river and
 * wooden bridge for money basics, a small high street for companies, the
 * peaks and a camp for risk. Edge trees, flowers and tufts continue down.
 */
export function ChapterLandscape({ scene, className }: { scene: ChapterScene; className?: string }) {
  const u = useUid();
  const ground = scene === "peaks" ? ["#eae3fc", "#d9f1e3", "#b2e2c3"] : scene === "town" ? ["#e3effb", "#def3e6", "#ace0bd"] : ["#eaf7ef", "#cdeed9", "#a7dfba"];
  return (
    <svg viewBox="0 0 400 720" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${u}-bg`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={ground[0]}/><stop offset=".3" stopColor={ground[1]}/><stop offset="1" stopColor={ground[2]}/>
        </linearGradient>
        <linearGradient id={`${u}-river`} x1="0" x2="1"><stop offset="0" stopColor="#9fd0f1"/><stop offset=".5" stopColor="#bfe1f8"/><stop offset="1" stopColor="#86c1ea"/></linearGradient>
        <linearGradient id={`${u}-lit`} x1="1" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d6ccf9"/><stop offset="1" stopColor="#9c8ade"/></linearGradient>
        <linearGradient id={`${u}-shade`} x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#8a78d0"/><stop offset="1" stopColor="#6553b8"/></linearGradient>
        <radialGradient id={`${u}-sun`}><stop offset="0" stopColor="#fff4cf"/><stop offset="1" stopColor="#ffd98a"/></radialGradient>
        <radialGradient id={`${u}-fire`}><stop offset="0" stopColor="#fff1b0"/><stop offset=".6" stopColor="#f6a14a"/><stop offset="1" stopColor="#e8673a"/></radialGradient>
      </defs>
      <rect width="400" height="720" fill={`url(#${u}-bg)`}/>
      <circle cx="356" cy="40" r="26" fill="#ffe3a3" opacity=".22"/>
      <circle cx="356" cy="40" r="12" fill={`url(#${u}-sun)`}/>
      <Cloud x={250} y={40} s={.7} opacity={.85}/><Cloud x={80} y={70} s={.5} opacity={.6}/>

      {scene === "meadow" ? (
        <g>
          <path d="M-20 168 Q90 118 200 150 T420 128 V720 H-20 Z" fill="#9ad9b1" opacity=".45"/>
          <path d="M-20 420 Q120 380 240 410 T420 400 V720 H-20 Z" fill="#8fd3a8" opacity=".35"/>
          <RoundTree x={316} y={150} s={1.1}/><RoundTree x={360} y={160} s={.85} tone="autumn"/>
          {/* the river with ripples, and a small wooden bridge */}
          <path d="M310 720 C292 610 388 570 336 470 S248 370 300 262 S360 190 330 150" fill="none" stroke="#e3c78d" strokeWidth="40" strokeLinecap="round" opacity=".5"/>
          <path d="M310 720 C292 610 388 570 336 470 S248 370 300 262 S360 190 330 150" fill="none" stroke={`url(#${u}-river)`} strokeWidth="30" strokeLinecap="round"/>
          <path d="M310 720 C292 610 388 570 336 470 S248 370 300 262 S360 190 330 150" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2.2" strokeDasharray="12 22"/>
          <g transform="translate(272 292) rotate(-14)">
            <path d="M-6 8 Q30 -10 66 8" stroke={A.woodDark} strokeWidth="5" fill="none" strokeLinecap="round"/>
            {[0, 8, 16, 24, 32, 40, 48, 56].map(px => <rect key={px} x={px - 2} y={-1 + Math.abs(px - 28) * 0.18} width="7" height="12" rx="1.5" fill={px % 16 ? A.wood : "#b98457"}/>)}
            <path d="M-4 -6 Q30 -22 64 -6" stroke={A.woodDark} strokeWidth="3" fill="none"/>
            <path d="M0 -8 v14 M30 -16 v14 M60 -8 v14" stroke={A.woodDark} strokeWidth="3"/>
          </g>
          <g fill="#9c95b8"><ellipse cx="318" cy="420" rx="7" ry="3.5"/><ellipse cx="300" cy="432" rx="6" ry="3"/></g>
          <Rock x={258} y={252} s={.9}/><Bush x={230} y={232} s={.9} berries/>
          <Flowers points={[[40, 214, "#fff"], [58, 222, A.amber], [180, 206, A.lavender], [206, 214, "#fff"], [120, 236, A.amber]]}/>
        </g>
      ) : scene === "town" ? (
        <g>
          <path d="M-20 214 Q120 190 250 210 T420 200 V720 H-20 Z" fill="#9ad9b1" opacity=".42"/>
          <path d="M-20 440 Q140 400 260 430 T420 420 V720 H-20 Z" fill="#8fd3a8" opacity=".35"/>
          {/* bunting across the street */}
          <path d="M150 64 Q260 92 400 66" stroke={A.woodDark} strokeWidth="1.2" fill="none"/>
          {[0, 1, 2, 3, 4, 5, 6].map(i => { const x = 166 + i * 34; const y = 70 + Math.sin(i / 6 * Math.PI) * 18; return <path key={i} d={`M${x} ${y} l9 0 l-4.5 11z`} fill={[A.coral, A.amber, A.violetMid, "#3fb57a"][i % 4]}/>; })}
          {/* bakery with a striped awning */}
          <g transform="translate(176 112)">
            <rect x="0" y="0" width="70" height="86" rx="4" fill="#fff6e4"/><path d="M-6 2 L35 -26 L76 2 Z" fill="#cf6a3c"/><path d="M35 -26 L76 2 H52 Z" fill="#b3542b"/>
            <rect x="12" y="10" width="46" height="12" rx="3" fill="#fff" stroke="#e3c78d"/><circle cx="35" cy="16" r="3.5" fill={A.amber}/>
            {[0, 1, 2, 3, 4, 5].map(i => <path key={i} d={`M${2 + i * 11} 30 h11 v10 q-5.5 5 -11 0z`} fill={i % 2 ? "#fff" : A.coral}/>)}
            <rect x="8" y="50" width="22" height="16" rx="2" fill="#bfe1f8"/><path d="M9 51 l8 0 l-8 8z" fill="#fff" opacity=".6"/>
            <rect x="40" y="50" width="20" height="36" rx="2" fill={A.woodDark}/><circle cx="56" cy="69" r="1.5" fill={A.amber}/>
          </g>
          {/* bike shop */}
          <g transform="translate(262 96)">
            <rect x="0" y="0" width="80" height="102" rx="4" fill="#eef4fb"/><rect x="-4" y="-10" width="88" height="14" rx="4" fill={A.forest}/>
            <circle cx="28" cy="20" r="7" fill="none" stroke={A.violet} strokeWidth="2.5"/><circle cx="52" cy="20" r="7" fill="none" stroke={A.violet} strokeWidth="2.5"/>
            <path d="M28 20 l10 -8 l14 8 M38 12 l-2 -3" stroke={A.violet} strokeWidth="2" fill="none"/>
            <rect x="10" y="40" width="26" height="20" rx="2" fill="#bfe1f8"/><rect x="44" y="40" width="26" height="20" rx="2" fill="#bfe1f8"/>
            <path d="M6 66 h68 l-5 9 h-58z" fill={A.amber}/><rect x="30" y="76" width="20" height="26" rx="2" fill="#5d7f9b"/>
          </g>
          {/* market stall with fruit crates */}
          <g transform="translate(346 150)">
            <path d="M0 0 h50 l6 14 h-62z" fill={A.violetMid}/><path d="M6 14 v36 M44 14 v36" stroke={A.woodDark} strokeWidth="3"/>
            <rect x="2" y="34" width="46" height="16" rx="2" fill={A.wood}/>
            <g><circle cx="10" cy="32" r="4" fill={A.coral}/><circle cx="19" cy="32" r="4" fill="#f6c76a"/><circle cx="29" cy="32" r="4" fill="#3fb57a"/><circle cx="39" cy="32" r="4" fill={A.coral}/></g>
          </g>
          {/* lamp post, cobbled street and trees */}
          <g transform="translate(160 200)"><path d="M0 0 V-58" stroke={A.ink} strokeWidth="3"/><rect x="-6" y="-70" width="12" height="13" rx="3" fill={A.ink}/><rect x="-4" y="-67" width="8" height="8" rx="2" fill="#ffe3a3"/></g>
          <path d="M140 204 H420 V224 H140 Z" fill="#e8dcc4"/>
          <g fill="#d6c7a8">{Array.from({ length: 12 }, (_, i) => <rect key={i} x={146 + i * 23} y={208 + (i % 2) * 6} width="16" height="5" rx="2"/>)}</g>
          <RoundTree x={120} y={204} s={1.05}/>
          <Flowers points={[[40, 236, A.amber], [60, 240, "#fff"], [96, 232, A.lavender]]}/>
        </g>
      ) : (
        <g>
          <path d="M-20 168 L70 70 L130 128 L200 50 L250 98 L300 60 L420 170 V250 H-20 Z" fill={`url(#${u}-lit)`} opacity=".85"/>
          <path d="M200 50 L250 98 L230 112 L214 80 Z M70 70 L130 128 L108 136 Z M300 60 L420 170 H380 L320 100 Z" fill={`url(#${u}-shade)`} opacity=".8"/>
          <path d="M200 50 L220 72 L210 70 L201 80 L191 70 L184 74 Z M70 70 L86 88 L78 86 L70 94 L62 84 Z M300 60 L318 78 L308 77 L300 86 L292 76 Z" fill="#fff"/>
          <path d="M201 50 V18" stroke={A.ink} strokeWidth="2.6" strokeLinecap="round"/>
          <path d="M202 19 q10 -3 15 1 q7 5 13 1 q-5 7 -13 4 q-7 -2 -15 2z" fill={A.amber}/>
          <path d="M-20 236 Q120 190 250 222 T420 208 V720 H-20 Z" fill="#9ad9b1" opacity=".6"/>
          <path d="M-20 450 Q130 410 250 440 T420 430 V720 H-20 Z" fill="#8fd3a8" opacity=".35"/>
          {/* camp: tent and a small campfire by a lake */}
          <g transform="translate(270 238)">
            <path d="M0 0 L30 -40 L60 0 Z" fill={A.coral}/><path d="M30 -40 L60 0 H40 Z" fill={A.coralDeep}/><path d="M22 0 L30 -14 L38 0 Z" fill="#7a2e1a"/>
            <path d="M30 -40 v-6" stroke={A.woodDark} strokeWidth="2"/>
            <g transform="translate(78 -2)"><path d="M-8 2 l16 -4 M-8 -2 l16 4" stroke={A.woodDark} strokeWidth="3" strokeLinecap="round"/><path d="M0 -2 q-7 -9 0 -18 q7 9 0 18z" fill={`url(#${u}-fire)`}/></g>
          </g>
          <ellipse cx="150" cy="262" rx="52" ry="9" fill="#bfe1f8"/><path d="M118 260 h20 M156 264 h18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          <Pine x={60} y={250} s={1}/><Pine x={84} y={258} s={.8} dark/>
          <Rock x={232} y={252} s={.8}/>
          <Flowers points={[[190, 248, "#fff"], [210, 254, A.lavender], [352, 252, A.amber]]}/>
        </g>
      )}

      {/* along the way down: trees on both edges, bushes, flowers and tufts */}
      {[300, 430, 560, 690].map((y, i) => (
        <g key={y}>
          {i % 2 ? <RoundTree x={24} y={y} s={.9}/> : <Pine x={26} y={y} s={1} dark={i % 3 === 0}/>}
          <Pine x={378} y={y + 50} s={.95} dark={i % 2 === 0}/>
          <Bush x={i % 2 ? 370 : 36} y={y + 34} s={.7} berries={i === 1}/>
          <Flowers points={[[60 + i * 7, y + 18, i % 2 ? A.amber : "#fff"], [340 - i * 5, y - 20, i % 2 ? "#fff" : A.lavender]]}/>
        </g>
      ))}
      <GrassTufts points={[[90, 330], [300, 380], [70, 480], [330, 520], [110, 610], [280, 660], [200, 700], [180, 290], [240, 560]]}/>
      <Flowers points={[[130, 300, "#fff"], [214, 340, A.amber], [168, 452, A.lavender], [232, 520, "#fff"], [150, 610, A.amber], [262, 300, A.lavender]]}/>
      <Rock x={196} y={392} s={.6}/><Bush x={120} y={520} s={.6}/>
      <g fill="#fff" opacity=".55"><circle cx="150" cy="350" r="2"/><circle cx="260" cy="470" r="2"/><circle cx="140" cy="560" r="2"/><circle cx="250" cy="650" r="2"/></g>
    </svg>
  );
}

/** Small chapter emblem for the wooden-sign headers. */
export function ChapterEmblem({ scene, className }: { scene: ChapterScene; className?: string }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${u}-coin`} cx=".4" cy=".35"><stop offset="0" stopColor="#ffe9a8"/><stop offset="1" stopColor={A.amber}/></radialGradient>
        <linearGradient id={`${u}-mtn`} x1="1" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c9bdf6"/><stop offset="1" stopColor="#8d7bd8"/></linearGradient>
      </defs>
      <ellipse cx="32" cy="48" rx="28" ry="6" fill={A.meadow} opacity=".7"/>
      {scene === "peaks" ? (
        <g><path d="M6 48 L26 16 L36 30 L44 20 L60 48 Z" fill={`url(#${u}-mtn)`}/><path d="M26 16 L44 48 H30 L28 30Z M44 20 L60 48 H52 Z" fill="#6553b8" opacity=".45"/>
          <path d="M26 16 L32 25 L27 24 L22 29 L20 25 Z" fill="#fff"/>
          <path d="M44 20 V5" stroke={A.ink} strokeWidth="2"/><path d="M45 5 q6 -2 9 1 q-3 4 -9 3z" fill={A.amber}/></g>
      ) : scene === "town" ? (
        <g><rect x="14" y="22" width="36" height="26" rx="3" fill="#fff6e4" stroke={A.ink} strokeWidth="2"/><path d="M10 23 L32 8 L54 23 Z" fill="#cf6a3c" stroke={A.ink} strokeWidth="2" strokeLinejoin="round"/>
          {[0, 1, 2, 3].map(i => <path key={i} d={`M${14 + i * 9} 29 h9 v5 q-4.5 3 -9 0z`} fill={i % 2 ? "#fff" : A.coral}/>)}
          <rect x="28" y="37" width="9" height="11" fill={A.woodDark}/><rect x="17" y="37" width="8" height="6" rx="1" fill="#bfe1f8"/></g>
      ) : (
        <g><path d="M8 48 Q22 30 34 40 T58 36 V48 Z" fill={A.leaf}/>
          <ellipse cx="34" cy="38" rx="11" ry="4" fill={A.amberDeep}/>
          <circle cx="32" cy="24" r="12.5" fill={`url(#${u}-coin)`} stroke={A.amberDeep} strokeWidth="2"/>
          <circle cx="32" cy="24" r="8.5" fill="none" stroke={A.amberDeep} strokeWidth="1.4" opacity=".7"/>
          <path d="M28 20 l4 -3 v14" stroke={A.amberDeep} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M24 18 q3 -4 7 -4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".8"/></g>
      )}
    </svg>
  );
}
