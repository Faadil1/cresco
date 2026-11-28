/**
 * "Grow your money skills" (issue #135): original vector illustrations for the
 * approved illustrated adventure art direction. Drawn for Cresco; no third-party
 * assets, no real people, no trackers. Decorative pieces are hidden from
 * assistive technology; the goal jar carries a real text alternative.
 */
import { a11y } from "./palette";

/** Adventure palette (kept beside the CSS tokens in globals.css). */
export const A = {
  ink: "#102d36",
  forest: "#147b56",
  leaf: "#2f9e6b",
  meadow: "#7fd09f",
  meadowLight: "#b7e8c6",
  mint: "#ddf5e8",
  ivory: "#fff9ec",
  violet: "#5936c7",
  violetMid: "#7a5ce0",
  lavender: "#b9a8f0",
  lavenderSoft: "#eee8fc",
  sky: "#dcebfa",
  skyMid: "#a9cdf0",
  amber: "#f6c76a",
  amberDeep: "#d99a2b",
  coral: "#ef8a5a",
  skin: "#f1c39d",
  skinShade: "#dea47c",
  hair: "#5a3824",
  rock: "#8f80c9",
  rockShade: "#7262b6",
  snow: "#ffffff",
} as const;

type ArtProps = { className?: string; title?: string };

function Pine({ x, y, s = 1, tone = A.forest }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2" y="-2" width="4" height="10" rx="1" fill={A.hair}/>
      <path d="M0 -40 L13 -16 H6 L16 0 H-16 L-6 -16 H-13 Z" fill={tone}/>
      <path d="M0 -40 L13 -16 H6 L16 0 H0 Z" fill="#000" opacity=".12"/>
    </g>
  );
}

function RoundTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.5" y="-6" width="5" height="14" rx="2" fill={A.hair}/>
      <circle cx="0" cy="-18" r="15" fill={A.leaf}/>
      <circle cx="6" cy="-14" r="10" fill={A.forest} opacity=".55"/>
      <circle cx="-5" cy="-23" r="5" fill={A.meadowLight} opacity=".55"/>
    </g>
  );
}

/** The young explorer: age-neutral, a backpack for the journey, one hand waving. */
export function ExplorerKid({ className, title }: ArtProps) {
  return (
    <svg viewBox="0 0 120 200" className={className} {...a11y(title)}>
      {/* backpack */}
      <rect x="22" y="72" width="34" height="50" rx="12" fill={A.coral}/>
      <rect x="25" y="96" width="26" height="16" rx="6" fill="#d9703f"/>
      <rect x="30" y="66" width="18" height="10" rx="5" fill="#d9703f"/>
      {/* legs and shoes */}
      <path d="M50 140 L46 182" stroke={A.ink} strokeWidth="11" strokeLinecap="round"/>
      <path d="M68 140 L74 182" stroke="#1d3c45" strokeWidth="11" strokeLinecap="round"/>
      <path d="M38 186 q6 -8 16 -3 v5 h-16z" fill={A.violet}/>
      <path d="M70 183 q10 -6 17 2 v4 h-17z" fill={A.violet}/>
      {/* shorts */}
      <path d="M42 128 h36 l3 20 h-17 l-3 -8 -3 8 h-19z" fill="#1d3c45"/>
      {/* body */}
      <path d="M40 86 q20 -12 40 0 l2 44 h-44z" fill={A.leaf}/>
      <path d="M62 80 q12 3 18 6 l2 44 h-20z" fill={A.forest} opacity=".35"/>
      <path d="M44 88 l6 40" stroke="#d9703f" strokeWidth="5" strokeLinecap="round"/>
      {/* waving arm */}
      <path d="M78 92 q14 -6 18 -26" stroke={A.leaf} strokeWidth="11" strokeLinecap="round" fill="none"/>
      <circle cx="97" cy="62" r="7" fill={A.skin}/>
      {/* other arm */}
      <path d="M42 94 q-6 18 -2 32" stroke={A.leaf} strokeWidth="10" strokeLinecap="round" fill="none"/>
      <circle cx="40" cy="128" r="6" fill={A.skin}/>
      {/* neck and head */}
      <rect x="54" y="70" width="12" height="12" rx="5" fill={A.skinShade}/>
      <ellipse cx="60" cy="52" rx="20" ry="21" fill={A.skin}/>
      <ellipse cx="41" cy="55" rx="4" ry="5.5" fill={A.skinShade}/>
      <path d="M39 50 q-2 -26 22 -28 q22 0 21 24 q-6 -10 -17 -12 q-3 6 -14 8 q-6 1 -12 8z" fill={A.hair}/>
      <path d="M55 26 q8 -6 16 -2" stroke="#7a5236" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="53" cy="55" r="2.6" fill={A.ink}/>
      <circle cx="68" cy="55" r="2.6" fill={A.ink}/>
      <circle cx="49" cy="62" r="3.5" fill={A.coral} opacity=".35"/>
      <circle cx="73" cy="62" r="3.5" fill={A.coral} opacity=".35"/>
      <path d="M54 63 q6 6 12 0" stroke={A.ink} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

/**
 * The Home landscape: lavender peaks, a flag at the summit, forest hills and a
 * trail. Meant to sit in the lower/right part of a violet hero card.
 */
export function MountainScene({ className, title, explorer = true }: ArtProps & { explorer?: boolean }) {
  return (
    <svg viewBox="0 0 640 320" preserveAspectRatio="xMaxYMax slice" className={className} {...a11y(title)}>
      <defs>
        <linearGradient id="adv-haze" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={A.lavender} stopOpacity="0"/>
          <stop offset="1" stopColor={A.lavenderSoft} stopOpacity=".55"/>
        </linearGradient>
        <linearGradient id="adv-hill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={A.meadow}/>
          <stop offset="1" stopColor={A.leaf}/>
        </linearGradient>
      </defs>
      <circle cx="560" cy="62" r="30" fill="#ffe3a3" opacity=".9"/>
      <circle cx="560" cy="62" r="46" fill="#ffe3a3" opacity=".18"/>
      <g fill="#fff" opacity=".45">
        <ellipse cx="420" cy="70" rx="34" ry="9"/><ellipse cx="444" cy="62" rx="20" ry="9"/>
        <ellipse cx="250" cy="44" rx="26" ry="7"/>
      </g>
      {/* far peaks */}
      <path d="M180 230 L300 92 L360 160 L430 70 L540 200 L640 120 V260 H180 Z" fill={A.lavender}/>
      <path d="M300 92 L322 118 L308 116 L296 128 L286 110 Z M430 70 L456 102 L440 98 L428 112 L414 92 Z" fill={A.snow} opacity=".9"/>
      <path d="M430 70 L540 200 L640 120 V260 H470 Z" fill={A.rock} opacity=".45"/>
      {/* main peak with the goal flag */}
      <path d="M330 250 L480 104 L600 250 Z" fill={A.rock}/>
      <path d="M480 104 L600 250 H520 L500 170 Z" fill={A.rockShade}/>
      <path d="M480 104 L506 130 L492 128 L482 140 L470 128 L458 132 Z" fill={A.snow}/>
      <path d="M481 104 V62" stroke={A.ink} strokeWidth="3" strokeLinecap="round"/>
      <path d="M482 63 L512 72 L482 82 Z" fill={A.amber}/>
      <rect x="0" y="180" width="640" height="80" fill="url(#adv-haze)"/>
      {/* hills */}
      <path d="M0 250 Q120 200 250 232 T520 226 T640 214 V320 H0 Z" fill="url(#adv-hill)"/>
      <path d="M0 282 Q160 236 330 270 T640 252 V320 H0 Z" fill={A.leaf}/>
      <path d="M0 300 Q200 276 420 296 T640 286 V320 H0 Z" fill={A.forest}/>
      {/* trail up to the mountain */}
      <path d="M210 320 C230 290 300 292 330 274 S390 246 420 240 S470 228 488 214" fill="none" stroke={A.ivory} strokeWidth="12" strokeLinecap="round"/>
      <path d="M210 320 C230 290 300 292 330 274 S390 246 420 240 S470 228 488 214" fill="none" stroke={A.amber} strokeOpacity=".5" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round"/>
      <Pine x={560} y={282} s={1.2}/><Pine x={590} y={276} s={.95} tone="#0f6648"/><Pine x={612} y={288} s={1.3}/>
      <Pine x={150} y={260} s={.8}/><Pine x={170} y={266} s={.95} tone="#0f6648"/>
      <RoundTree x={380} y={292} s={.9}/>
      {explorer ? <g transform="translate(250 196) scale(.62)"><ExplorerKid/></g> : null}
    </svg>
  );
}

export type ChapterScene = "meadow" | "town" | "peaks";

/**
 * Tall chapter landscapes behind the Learn trail (sliced to any size). Each
 * chapter has its own place on the same journey: a meadow and river for
 * money basics, a small high street for companies, the peaks for risk.
 */
export function ChapterLandscape({ scene, className }: { scene: ChapterScene; className?: string }) {
  return (
    <svg viewBox="0 0 400 720" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`land-${scene}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={scene === "peaks" ? "#e7e0fb" : scene === "town" ? "#e3effb" : "#e9f8ee"}/>
          <stop offset=".35" stopColor={scene === "peaks" ? "#dcf1e4" : scene === "town" ? "#e2f4e8" : "#c9edd6"}/>
          <stop offset="1" stopColor={scene === "peaks" ? "#b4e3c4" : "#a9dfba"}/>
        </linearGradient>
      </defs>
      <rect width="400" height="720" fill={`url(#land-${scene})`}/>
      {scene === "peaks" ? (
        <g>
          <path d="M-20 170 L80 60 L150 130 L230 40 L330 150 L420 80 V240 H-20 Z" fill={A.lavender} opacity=".75"/>
          <path d="M230 40 L252 66 L238 62 L228 74 L216 58 Z M80 60 L98 80 L86 78 L78 88 L68 74 Z" fill="#fff"/>
          <path d="M231 40 V8" stroke={A.ink} strokeWidth="2.5"/><path d="M232 9 L254 16 L232 24 Z" fill={A.amber}/>
          <path d="M-20 240 Q120 190 250 226 T420 210 V720 H-20 Z" fill={A.meadow} opacity=".55"/>
        </g>
      ) : scene === "town" ? (
        <g>
          <g transform="translate(250 140)">
            <rect x="0" y="0" width="56" height="62" rx="4" fill="#fff"/><path d="M-6 0 L28 -24 L62 0 Z" fill={A.coral}/>
            <rect x="8" y="14" width="40" height="12" rx="3" fill={A.lavenderSoft}/>
            <path d="M4 30 h48 l-4 8 h-40z" fill={A.violet} opacity=".7"/><rect x="20" y="42" width="16" height="20" rx="2" fill={A.skyMid}/>
          </g>
          <g transform="translate(60 120)">
            <rect x="0" y="0" width="70" height="82" rx="4" fill="#fffdf6"/><rect x="0" y="-10" width="70" height="14" rx="4" fill={A.forest}/>
            <rect x="10" y="16" width="20" height="16" rx="2" fill={A.sky}/><rect x="40" y="16" width="20" height="16" rx="2" fill={A.sky}/>
            <path d="M4 40 h62 l-5 9 h-52z" fill={A.amber}/><rect x="26" y="56" width="18" height="26" rx="2" fill={A.skyMid}/>
          </g>
          <path d="M-20 214 Q120 190 250 210 T420 200 V720 H-20 Z" fill={A.meadow} opacity=".5"/>
          <RoundTree x={180} y={204} s={1}/><RoundTree x={350} y={206} s={.8}/>
        </g>
      ) : (
        <g>
          <path d="M-20 150 Q90 100 200 140 T420 120 V240 H-20 Z" fill={A.meadow} opacity=".5"/>
          <circle cx="340" cy="60" r="22" fill="#ffe3a3" opacity=".9"/>
          <path d="M300 720 C280 600 380 560 330 470 S240 360 300 260" fill="none" stroke={A.skyMid} strokeWidth="26" strokeLinecap="round" opacity=".7"/>
          <path d="M300 720 C280 600 380 560 330 470 S240 360 300 260" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="10 16" opacity=".7"/>
          <RoundTree x={60} y={150} s={1.1}/><RoundTree x={110} y={160} s={.8}/>
        </g>
      )}
      {/* scattered trees along both edges, all the way down */}
      {[260, 390, 520, 650].map((y, i) => (
        <g key={y}>
          <Pine x={i % 2 ? 22 : 30} y={y} s={.9} tone={i % 2 ? "#0f6648" : A.forest}/>
          <Pine x={i % 2 ? 384 : 376} y={y + 40} s={.85} tone={i % 2 ? A.forest : "#0f6648"}/>
        </g>
      ))}
      <g fill={A.ivory} opacity=".55">
        <circle cx="80" cy="330" r="2.5"/><circle cx="330" cy="420" r="2.5"/><circle cx="120" cy="560" r="2.5"/><circle cx="300" cy="640" r="2.5"/>
      </g>
    </svg>
  );
}

/** Small chapter emblem for the wooden-sign headers. */
export function ChapterEmblem({ scene, className }: { scene: ChapterScene; className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} aria-hidden>
      <ellipse cx="32" cy="48" rx="28" ry="6" fill={A.meadow} opacity=".6"/>
      {scene === "peaks" ? (
        <g><path d="M6 48 L26 18 L36 30 L44 20 L60 48 Z" fill={A.rock}/><path d="M26 18 L32 26 L26 25 L21 30 Z" fill="#fff"/>
          <path d="M44 20 V6" stroke={A.ink} strokeWidth="2"/><path d="M45 6 L56 10 L45 14 Z" fill={A.amber}/></g>
      ) : scene === "town" ? (
        <g><rect x="14" y="22" width="36" height="26" rx="3" fill="#fff" stroke={A.ink} strokeWidth="2"/><path d="M10 22 L32 8 L54 22 Z" fill={A.coral}/>
          <path d="M14 30 h36" stroke={A.violet} strokeWidth="4"/><rect x="27" y="36" width="10" height="12" fill={A.skyMid}/></g>
      ) : (
        <g><path d="M8 48 Q22 30 34 40 T58 36 V48 Z" fill={A.leaf}/>
          <circle cx="32" cy="24" r="12" fill={A.amber} stroke={A.amberDeep} strokeWidth="2"/><path d="M32 18 v12 M28 21 h6 a3 3 0 0 1 0 6 h-6" stroke={A.amberDeep} strokeWidth="2" fill="none" strokeLinecap="round"/></g>
      )}
    </svg>
  );
}
