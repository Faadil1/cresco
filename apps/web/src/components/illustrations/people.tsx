import { P, STROKE, a11y } from "./palette";

type SvgProps = { className?: string; title?: string };

// Small profile art has subtle expressions, layered hair and comfortable color.
// Role illustrations depict characters, not actual CRESCO customers.

function Teen({ x = 0, y = 0, s = 1, top = P.blue }: { x?: number; y?: number; s?: number; top?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-24 48c0-15 10-24 24-24s24 9 24 24z" fill={top} />
      <path d="M-4 24v-6h8v6c0 2.5-8 2.5-8 0z" fill={P.ochreSoft} />
      <ellipse cx="0" cy="2" rx="12" ry="13" fill={P.ochreSoft} />
      <path d="M-12.6 3.5C-14 -8 -7.5 -13 0.5 -13 8.5 -13 14 -7.5 12.6 1 10 -3 4 -5.5 -3 -5c-4 .3-7.5 3.5-9.6 8.5z" fill={P.ink} />
      <path d="M-8 -4c5-5 11-6 17-2" fill="none" stroke={P.ink2} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M-7 5h3m8 0h3" stroke={P.ink2} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-3 11c2 2 5 2 7 0" fill="none" stroke="#bd7a63" strokeWidth="1.2" strokeLinecap="round" />

    </g>
  );
}

function Adult({ x = 0, y = 0, s = 1, top = P.ink }: { x?: number; y?: number; s?: number; top?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-26 50c0-16 11-25 26-25s26 9 26 25z" fill={top} />
      <path d="M-4.5 25v-7h9v7c0 3-9 3-9 0z" fill={P.claySoft} />
      <ellipse cx="0" cy="1" rx="12.5" ry="14" fill={P.claySoft} />
      <path d="M-13.5 6c-2-6-1-12 3-15.5 4-3.5 12-3.8 16.5-.5 4.5 3 6.5 8 5.5 13-1.5-4.5-5-7-9-7.5-1.5 2.8-6 4.5-10.5 4.5-2.5 0-4.5 2-5.5 6z" fill={P.ink2} />
      <path d="M-8 3c2-1 4-1 6 0m5 0c2-1 4-1 6 0" stroke={P.ink2} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M-4 11c3 2 6 2 9-1" fill="none" stroke="#b86d5c" strokeWidth="1.2" strokeLinecap="round" />

    </g>
  );
}

export function KidBust({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...a11y(title)}>
      <circle cx="32" cy="32" r="30" fill={P.blueSoft} />
      <clipPath id="kid-bust-clip">
        <circle cx="32" cy="32" r="30" />
      </clipPath>
      <g clipPath="url(#kid-bust-clip)">
        <Teen x={32} y={30} s={1.1} />
      </g>
    </svg>
  );
}

export function ParentBust({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...a11y(title)}>
      <circle cx="32" cy="32" r="30" fill={P.sageSoft} />
      <clipPath id="parent-bust-clip">
        <circle cx="32" cy="32" r="30" />
      </clipPath>
      <g clipPath="url(#parent-bust-clip)">
        <Adult x={32} y={30} s={1.02} top={P.sage} />
      </g>
    </svg>
  );
}

/** The whole idea in one picture: a teen acts under the line, asks once above it. */
export function WelcomeScene({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 360 300" className={className} {...a11y(title)}>
      <rect x="8" y="8" width="344" height="284" rx="28" fill={P.surface} stroke={P.line} />
      {/* the line */}
      <path d="M36 150h288" stroke={P.ink} strokeWidth="1.5" />
      <path d="M216 120v60" stroke={P.blue} strokeWidth="1.5" />
      <text x="224" y="128" fontSize="12" fill={P.blue} fontFamily="Inter, sans-serif">line</text>
      {/* acts alone */}
      <circle cx="78" cy="150" r="5" fill={P.ink} />
      <circle cx="120" cy="150" r="5" fill={P.ink} />
      <circle cx="162" cy="150" r="5" fill={P.ink} />
      {/* asks once */}
      <circle cx="268" cy="150" r="7" fill={P.surface} stroke={P.blue} strokeWidth="2" />
      <path d="M252 104h44a10 10 0 0 1 10 10v8a10 10 0 0 1-10 10h-18l-8 8-2-8h-16a10 10 0 0 1-10-10v-8a10 10 0 0 1 10-10z" fill={P.white} stroke={P.ink} strokeWidth="1.25" />
      <circle cx="262" cy="118" r="2" fill={P.ink} />
      <circle cx="274" cy="118" r="2" fill={P.ink} />
      <circle cx="286" cy="118" r="2" fill={P.ink} />
      {/* people */}
      <Teen x={120} y={214} s={1.4} />
      <Adult x={268} y={210} s={1.4} top={P.sage} />
      <path d="M36 276h288" stroke={P.line} />
    </svg>
  );
}

export function ThinkingKid({ className, title }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} {...a11y(title)}>
      <circle cx="60" cy="64" r="50" fill={P.blueSoft} />
      <clipPath id="thinking-kid-clip">
        <circle cx="60" cy="64" r="50" />
      </clipPath>
      <g clipPath="url(#thinking-kid-clip)">
        <Teen x={58} y={76} s={1.7} />
      </g>
      <circle cx="94" cy="26" r="13" fill={P.white} stroke={P.ink} strokeWidth="1.25" />
      <path d="M90 22.5a4 4 0 1 1 5 3.9c-1 .3-1 1-1 2.1" {...STROKE} strokeWidth={1.4} />
      <circle cx="94" cy="32" r="1.2" fill={P.ink} />
      <circle cx="80" cy="42" r="3" fill={P.white} stroke={P.ink} strokeWidth="1.25" />
    </svg>
  );
}
