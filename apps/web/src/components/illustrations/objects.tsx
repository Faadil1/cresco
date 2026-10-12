import type { GoalId } from "@/domain/types";

import { P, STROKE, a11y } from "./palette";

type SvgProps = { className?: string; title?: string };

/* ------------------------------------------------------------------ */
/* Brand mark                                                           */
/* ------------------------------------------------------------------ */

/** Living Key mark: growth above a clear standing boundary. */
export function CrescoMark({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(title)}>
      <circle cx="20" cy="20" r="19" fill={P.sageSoft} />
      <path d="M20 32V13" fill="none" stroke={P.sage} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 24C7 24 5 15 6 10c9-1 15 4 14 14z" fill={P.sage} />
      <path d="M20 19c0-11 5-15 15-15 1 9-3 14-15 15z" fill="#8eb579" />
      <path d="M11 34h18" stroke={P.ink} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="20" cy="32" r="2.6" fill={P.ink} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Growth objects                                                       */
/* ------------------------------------------------------------------ */

export function PlantPot({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 96 96" className={className} {...a11y(title)}>
      <circle cx="48" cy="44" r="34" fill={P.sageSoft} />
      <path d="M48 62V30" {...STROKE} />
      <path d="M48 44c-9 0-15-6-15-15 9 0 15 6 15 15z" fill={P.sage} />
      <path d="M48 36c7 0 12-5 12-12-7 0-12 5-12 12z" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M33 62h30l-3.5 20a3 3 0 0 1-3 2.5H39.5a3 3 0 0 1-3-2.5z" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M31 62h34" {...STROKE} />
    </svg>
  );
}

export function Sprout({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} {...a11y(title)}>
      <path d="M16 28V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 19c-6 0-9-3.5-9-9 6 0 9 3.5 9 9z" fill="currentColor" />
      <path d="M16 15c4.5 0 7-2.8 7-7-4.5 0-7 2.8-7 7z" fill="currentColor" opacity=".55" />
    </svg>
  );
}

export function Target({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...a11y(title)}>
      <circle cx="32" cy="32" r="26" fill={P.blueSoft} />
      <circle cx="32" cy="32" r="18" {...STROKE} />
      <circle cx="32" cy="32" r="10" {...STROKE} />
      <circle cx="32" cy="32" r="3.5" fill={P.blue} />
      <path d="M32 32l18-18M44 14h6v6" {...STROKE} />
    </svg>
  );
}

/** A quiet horizon of rising blocks, drawn as one line. */
export function Skyline({ className, title }: SvgProps) {
  const blocks: [number, number, number][] = [
    [8, 30, 28], [40, 16, 30], [74, 36, 22], [100, 22, 34], [138, 10, 26],
    [168, 28, 30], [202, 18, 24], [230, 34, 30], [264, 14, 28], [296, 26, 24], [324, 20, 30],
  ];
  return (
    <svg viewBox="0 0 360 64" preserveAspectRatio="xMidYMax slice" className={className} {...a11y(title)}>
      {blocks.map(([x, y, w], i) => (
        <rect key={x} x={x} y={y} width={w} height={64 - y} rx="2" fill={i === 4 ? P.blueSoft : P.fog} stroke={P.line} strokeWidth="1" />
      ))}
      <circle cx="152" cy="5" r="3" fill={P.blue} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Goal art: one object on a tinted disc                                */
/* ------------------------------------------------------------------ */

function Disc({ fill }: { fill: string }) {
  return <ellipse cx="60" cy="42" rx="38" ry="36" fill={fill} />;
}

function Bike() {
  return (
    <>
      <Disc fill={P.blueSoft} />
      <circle cx="38" cy="54" r="13" {...STROKE} />
      <circle cx="82" cy="54" r="13" {...STROKE} />
      <path d="M38 54l14-22h22l8 22M52 32l12 22h-26M64 54l10-22M48 26h10M70 26h8" {...STROKE} />
      <circle cx="64" cy="54" r="2.5" fill={P.blue} />
    </>
  );
}

function Gamepad() {
  return (
    <>
      <Disc fill={P.claySoft} />
      <path d="M34 34h52c8 0 13 8 13 18s-4 15-10 15c-5 0-8-4-12-8H43c-4 4-7 8-12 8-6 0-10-5-10-15s5-18 13-18z" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M40 45v10M35 50h10" {...STROKE} />
      <circle cx="78" cy="46" r="3" fill={P.clay} />
      <circle cx="86" cy="53" r="3" {...STROKE} />
    </>
  );
}

function GradCap() {
  return (
    <>
      <Disc fill={P.sageSoft} />
      <path d="M60 22l38 14-38 14-38-14z" fill={P.ink} />
      <path d="M38 43v12c0 5 10 9 22 9s22-4 22-9V43" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M94 37v16" {...STROKE} />
      <circle cx="94" cy="56" r="3" fill={P.sage} />
    </>
  );
}

function Island() {
  return (
    <>
      <Disc fill={P.ochreSoft} />
      <circle cx="82" cy="24" r="7" fill={P.ochre} />
      <path d="M22 62c10-4 20-4 30 0s20 4 30 0 14-3 18-1" {...STROKE} />
      <path d="M36 56c8-8 32-8 40 0" fill={P.white} stroke={P.ink} strokeWidth="1.5" />
      <path d="M56 52c0-10 2-18 6-24" {...STROKE} />
      <path d="M62 28c-6-4-14-3-18 2M62 28c5-5 13-5 17 0M62 28c0-6 4-10 9-11" {...STROKE} />
    </>
  );
}

function Piggy() {
  return (
    <>
      <Disc fill={P.blueSoft} />
      <path d="M30 48c0-12 12-20 28-20 14 0 24 6 28 14h6v12h-6c-2 4-5 7-9 9v7h-9v-5c-4 1-10 1-14 0v5h-9v-8c-9-4-15-8-15-14z" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="76" cy="44" r="1.8" fill={P.ink} />
      <path d="M50 34h14" {...STROKE} />
      <circle cx="57" cy="20" r="6" fill={P.blue} />
    </>
  );
}

const GOAL_ART: Record<GoalId, () => React.JSX.Element> = {
  bike: Bike,
  gaming: Gamepad,
  college: GradCap,
  trip: Island,
  "first-1000": Piggy,
};

export function GoalArt({ goal, className, title }: SvgProps & { goal: GoalId }) {
  const Art = GOAL_ART[goal];
  return (
    <svg viewBox="0 0 120 84" className={className} {...a11y(title)}>
      <Art />
    </svg>
  );
}
