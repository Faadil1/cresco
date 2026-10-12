import type { AchievementId } from "@/domain/types";

import { P, STROKE } from "./palette";

// Badges are small seals: a tinted disc, a fine ring, one line icon and one
// solid accent shape. Locked badges keep the shape and lose the colour.
const TONE: Record<AchievementId, { soft: string; accent: string }> = {
  "first-investor": { soft: P.blueSoft, accent: P.blue },
  "streak-5": { soft: P.claySoft, accent: P.clay },
  "company-detective": { soft: P.ochreSoft, accent: P.ochre },
  "diversification-pro": { soft: P.sageSoft, accent: P.sage },
  "money-master": { soft: P.blueSoft, accent: P.blue },
  "ten-lessons": { soft: P.sageSoft, accent: P.sage },
};

function Icon({ badge, accent }: { badge: AchievementId; accent: string }) {
  switch (badge) {
    case "first-investor":
      // a first step up: one bar, then a taller one with the accent
      return (
        <>
          <rect x="27" y="40" width="9" height="13" rx="1.5" {...STROKE} />
          <rect x="40" y="29" width="9" height="24" rx="1.5" fill={accent} />
          <path d="M25 56h30" {...STROKE} />
        </>
      );
    case "streak-5":
      // five days, all lit
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={24 + i * 8} cy="40" r="3" fill={accent} />
          ))}
          <path d="M22 50h36" {...STROKE} />
          <path d="M22 30h36" {...STROKE} opacity=".35" />
        </>
      );
    case "company-detective":
      return (
        <>
          <circle cx="37" cy="37" r="11" {...STROKE} />
          <path d="M45 45l9 9" {...STROKE} strokeWidth={2.5} />
          <path d="M31 39l4-4 3 3 5-6" stroke={accent} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case "diversification-pro":
      return (
        <>
          <circle cx="40" cy="40" r="14" {...STROKE} />
          <path d="M40 40V26a14 14 0 0 1 13.3 9.7z" fill={accent} />
          <path d="M40 40l13.3-4.3" {...STROKE} />
          <path d="M40 40l-9.9 9.9" {...STROKE} />
        </>
      );
    case "money-master":
      // a coin with a single serif mark
      return (
        <>
          <circle cx="40" cy="40" r="14" fill={accent} />
          <circle cx="40" cy="40" r="10" stroke={P.white} strokeWidth={1} fill="none" opacity=".6" />
          <path d="M40 33v14M36.5 36.5c0-1.6 1.6-2.5 3.5-2.5s3.5.9 3.5 2.5-1.6 2.3-3.5 3-3.5 1.4-3.5 3 1.6 2.5 3.5 2.5 3.5-.9 3.5-2.5" stroke={P.white} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </>
      );
    case "ten-lessons":
      // an open book, one page marked
      return (
        <>
          <path d="M40 30c-4-2.5-9-3-14-2v24c5-1 10-.5 14 2 4-2.5 9-3 14-2V28c-5-1-10-.5-14 2z" {...STROKE} />
          <path d="M40 30v24" {...STROKE} />
          <path d="M45 27v10l2.5-2 2.5 2V26.5" fill={accent} />
        </>
      );
  }
}

export function BadgeArt({ badge, earned = true, className }: { badge: AchievementId; earned?: boolean; className?: string }) {
  const tone = earned ? TONE[badge] : { soft: P.fog, accent: P.ink3 };
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden style={earned ? undefined : { opacity: 0.55 }}>
      <circle cx="40" cy="40" r="34" fill={tone.soft} />
      <circle cx="40" cy="40" r="30" fill="none" stroke={tone.accent} strokeWidth={1} opacity=".45" />
      <g opacity={earned ? 1 : 0.6}>
        <Icon badge={badge} accent={tone.accent} />
      </g>
    </svg>
  );
}
