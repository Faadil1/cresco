import type { IllustrationKey, MarketAsset } from "@/domain/types";

import { P, STROKE, a11y } from "./palette";

type SvgProps = { className?: string; title?: string };

// Lesson scenes share one frame: a fog card, a fine ink drawing and a single
// accent that marks the idea of the lesson.
function Frame({ children, className, title }: SvgProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 320 200" className={className} {...a11y(title)}>
      <rect width="320" height="200" fill={P.surface} />
      <path d="M24 176h272" stroke={P.line} />
      {children}
    </svg>
  );
}

/** Owning one slice of a shop: the ownership metaphor of the first lesson. */
export function PizzaShopScene({ className, title, caption }: SvgProps & { caption?: string }) {
  const cx = 160;
  const cy = 98;
  const r = 62;
  const slices = 8;
  const pt = (i: number) => {
    const a = (i / slices) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const [x0, y0] = pt(1);
  const [x1, y1] = pt(2);
  return (
    <Frame className={className} title={title}>
      <circle cx={cx} cy={cy} r={r + 8} fill={P.ochreSoft} />
      <circle cx={cx} cy={cy} r={r} fill={P.white} stroke={P.ink} strokeWidth="1.5" />
      {Array.from({ length: slices }, (_, i) => {
        const [x, y] = pt(i);
        return <path key={i} d={`M${cx} ${cy}L${x.toFixed(2)} ${y.toFixed(2)}`} stroke={P.line} strokeWidth="1.25" />;
      })}
      <path d={`M${cx} ${cy}L${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`} fill={P.blue} transform="translate(8 -4)" />
      {[[136, 76], [178, 130], [130, 122], [190, 66]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={P.ochre} opacity=".7" />
      ))}
      {caption ? (
        <g>
          <rect x="236" y="34" width="56" height="26" rx="13" fill={P.ink} />
          <text x="264" y="51.5" textAnchor="middle" fontSize="13" fontWeight="600" fill={P.white} fontFamily="Inter, sans-serif">
            {caption}
          </text>
          <path d="M236 47c-14 0-20 4-24 12" {...STROKE} strokeWidth={1.25} />
        </g>
      ) : null}
    </Frame>
  );
}

function StorefrontScene({ className, title }: SvgProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M92 176V78h136v98" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M84 78l14-30h124l14 30z" fill={P.blueSoft} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${84 + i * 38} 78c0 9 6 14 19 14s19-5 19-14`} fill={i === 1 ? P.blue : P.white} stroke={P.ink} strokeWidth="1.5" />
      ))}
      <rect x="108" y="112" width="48" height="40" rx="3" fill={P.fog} stroke={P.ink} strokeWidth="1.25" />
      <path d="M176 176v-58h30v58" fill={P.surface} stroke={P.ink} strokeWidth="1.5" />
      <circle cx="200" cy="148" r="2" fill={P.ink} />
      <path d="M118 140l10-10 8 6 12-14" stroke={P.sage} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

function ChartScene({ className, title }: SvgProps) {
  const pts = "48,150 82,132 112,140 146,108 178,118 210,82 244,92 274,56";
  return (
    <Frame className={className} title={title}>
      {[60, 100, 140].map((y) => (
        <path key={y} d={`M40 ${y}h240`} stroke={P.line} strokeDasharray="2 5" />
      ))}
      <polygon points={`${pts} 274,176 48,176`} fill={P.blueSoft} />
      <polyline points={pts} fill="none" stroke={P.blue} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="274" cy="56" r="5" fill={P.white} stroke={P.blue} strokeWidth="2" />
      <circle cx="146" cy="108" r="3" fill={P.ink} />
    </Frame>
  );
}

function ScaleScene({ className, title }: SvgProps) {
  return (
    <Frame className={className} title={title}>
      <path d="M160 40v136M128 176h64M84 70h152" {...STROKE} />
      <circle cx="160" cy="40" r="5" fill={P.ink} />
      <path d="M84 70l-24 52h48z" fill="none" stroke={P.ink} strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M236 70l-24 52h48z" fill="none" stroke={P.ink} strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M56 122a28 10 0 0 0 56 0z" fill={P.sageSoft} stroke={P.ink} strokeWidth="1.5" />
      <path d="M208 122a28 10 0 0 0 56 0z" fill={P.blueSoft} stroke={P.ink} strokeWidth="1.5" />
      <circle cx="84" cy="112" r="9" fill={P.sage} />
      <rect x="226" y="102" width="20" height="18" rx="3" fill={P.blue} />
    </Frame>
  );
}

function BasketScene({ className, title }: SvgProps) {
  return (
    <Frame className={className} title={title}>
      <circle cx="128" cy="90" r="18" fill={P.blue} />
      <circle cx="166" cy="80" r="16" fill={P.sage} />
      <circle cx="198" cy="94" r="15" fill={P.ochre} />
      <circle cx="150" cy="104" r="14" fill={P.clay} />
      <path d="M92 104h136l-14 64a8 8 0 0 1-8 6H114a8 8 0 0 1-8-6z" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M120 120l6 40M160 120v40M200 120l-6 40M100 134h120" stroke={P.line} strokeWidth="1.25" />
      <path d="M104 104c4-30 24-48 56-48s52 18 56 48" {...STROKE} />
    </Frame>
  );
}

function SharesScene({ className, title }: SvgProps) {
  const cells = Array.from({ length: 24 }, (_, i) => i);
  return (
    <Frame className={className} title={title}>
      {cells.map((i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const mine = i === 9;
        return (
          <rect
            key={i}
            x={94 + col * 23}
            y={50 + row * 23}
            width="19"
            height="19"
            rx="3"
            fill={mine ? P.blue : P.white}
            stroke={mine ? P.blue : P.line}
            strokeWidth="1.25"
          />
        );
      })}
      <path d="M154 72c30-34 70-30 92-14" {...STROKE} strokeWidth={1.25} />
      <text x="248" y="56" fontSize="13" fill={P.ink} fontFamily="Inter, sans-serif">1 share</text>
    </Frame>
  );
}

function PiggyScene({ className, title }: SvgProps) {
  return (
    <Frame className={className} title={title}>
      <circle cx="162" cy="42" r="12" fill={P.blue} />
      <path d="M162 58v14" {...STROKE} strokeDasharray="2 4" />
      <path d="M100 124c0-28 26-46 62-46 30 0 50 12 58 30h12v26h-12c-5 9-11 15-20 20v16h-18v-11c-9 2-21 2-30 0v11h-18v-17c-20-8-34-17-34-29z" fill={P.white} stroke={P.ink} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M146 88h30" {...STROKE} strokeWidth={2.5} />
      <circle cx="204" cy="114" r="2.5" fill={P.ink} />
    </Frame>
  );
}

export function LessonIllustration({
  kind,
  caption,
  className,
  title,
}: SvgProps & { kind: IllustrationKey; caption?: string }) {
  switch (kind) {
    case "pizza":
      return <PizzaShopScene className={className} title={title} caption={caption} />;
    case "storefront":
      return <StorefrontScene className={className} title={title} />;
    case "chart":
      return <ChartScene className={className} title={title} />;
    case "scale":
      return <ScaleScene className={className} title={title} />;
    case "basket":
      return <BasketScene className={className} title={title} />;
    case "shares":
      return <SharesScene className={className} title={title} />;
    case "piggy":
    default:
      return <PiggyScene className={className} title={title} />;
  }
}

/** Company hero: a calm facade with the company's own colour on the sign. */
export function CompanyHero({ asset, className }: { asset: MarketAsset; className?: string }) {
  const { background, foreground, mark } = asset.brand;
  const light = background.toLowerCase() === "#ffffff";
  return (
    <svg viewBox="0 0 390 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="390" height="200" fill={P.fog} />
      <path d="M0 200V96h48v104M342 200V70h48v130" fill={P.surface} stroke={P.line} />
      <path d="M96 200V82a12 12 0 0 1 12-12h174a12 12 0 0 1 12 12v118" fill={P.white} stroke={P.ink} strokeWidth="1.25" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={116 + i * 41} y="120" width="33" height="80" rx="2" fill={P.surface} stroke={P.line} />
      ))}
      <rect x="160" y="84" width="70" height="26" rx="13" fill={background} stroke={light ? P.line : "none"} />
      <text x="195" y="102" textAnchor="middle" fontSize={mark.length > 2 ? 12 : 16} fontWeight="600" fill={foreground} fontFamily="Inter, sans-serif">
        {mark}
      </text>
      <path d="M0 199.5h390" stroke={P.ink} strokeOpacity=".2" />
    </svg>
  );
}
