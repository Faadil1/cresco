/**
 * Original local-only character art for Mina, an invented teenager whose
 * family runs Neighborhood Markets. Consistent across Explore, outcome and
 * the family discussion; never an image of a real child or business.
 *
 * Inline SVG: zero remote image requests. Avoid gradients / shared SVG ids,
 * since several story references can render on the same screen.
 */
type MinaGroceryArtProps = {
  className?: string;
  title?: string;
};

export function MinaGroceryArt({
  className,
  title = "Illustration of fictional Mina in her family's grocery, with fresh produce and a rising delivery bill",
}: MinaGroceryArtProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 310" role="img" aria-label={title}
      className={className}>
      <rect width="300" height="310" rx="23" fill="#FAF2DE"/>
      <path d="M0 0h300v79H0z" fill="#DBEEE1"/>
      <rect x="18" y="22" width="264" height="57" rx="9" fill="#F9DDA9"/>
      <path d="M18 31v20c0 17 20 20 26 5 7 16 27 16 34 0 7 16 27 16 34 0 7 16 27 16 34 0 7 16 27 16 34 0 7 16 27 16 34 0 7 16 27 16 34 0v-25z" fill="#CF704D"/>
      <path d="M44 31v30m68-30v30m68-30v30m68-30v30" stroke="#F9E2B4" strokeWidth="11"/>
      <rect x="17" y="82" width="266" height="211" rx="8" fill="#FFF8E8"/>
      <rect x="24" y="94" width="104" height="117" rx="7" fill="#C5D9CA"/>
      <path d="M75 96v114m-50-49h102" stroke="#FFF9EA" strokeWidth="5"/>
      <path d="M26 203c18-17 32-25 50-24 17 2 33 7 51-16v47H26z" fill="#84A889" opacity=".65"/>
      <rect x="14" y="212" width="272" height="17" rx="7" fill="#BD8563"/>
      <rect x="14" y="226" width="272" height="68" rx="7" fill="#D7AC7B"/>
      <path d="M16 244h267M16 270h267" stroke="#BD8F65" strokeWidth="4"/>
      {/* Crates and fruit bring the family grocery to life. */}
      <rect x="25" y="184" width="91" height="46" rx="6" fill="#96734F"/>
      <path d="M34 185c4-24 19-24 27 0m-8 0c7-25 21-25 29 0m-11 0c8-19 26-24 36 0" fill="#6D9857" stroke="#56784C" strokeWidth="3"/>
      <circle cx="42" cy="204" r="11" fill="#ED9F48"/><circle cx="67" cy="205" r="12" fill="#D95B48"/>
      <circle cx="90" cy="204" r="11" fill="#F2C356"/>
      <path d="M39 192l4-5m22 6 2-7m22 6 3-6" stroke="#4B845A" strokeWidth="3" strokeLinecap="round"/>
      <rect x="215" y="188" width="52" height="42" rx="6" fill="#B99572"/>
      <path d="M222 207c-8-10 4-21 14-15 3-16 24-15 25 1 10 7 4 19-7 20z" fill="#F2D395"/>
      <path d="M227 216h31" stroke="#A07652" strokeWidth="3"/>
      {/* Mina: a consistent fictional character, in a teal apron over orange. */}
      <path d="M119 285v-77c1-31 21-51 52-51 34 0 57 22 58 56v72z" fill="#DB8A60"/>
      <path d="M129 218l18-22 12 23 25 0 18-24 17 25v65h-90z" fill="#357A6C"/>
      <path d="M143 220l-15 65m77-64 14 64" stroke="#24594E" strokeWidth="4"/>
      <path d="M149 245h53v31h-53z" fill="#559989"/>
      <path d="M153 248h45v24h-45z" fill="#76AB98"/>
      <path d="M149 160v23c0 23 16 34 28 34s27-15 27-34v-23" fill="#B97758"/>
      <path d="M122 118c-14-22-3-41 15-47 7-22 31-30 49-19 24-6 48 12 47 35 17 17 8 42-8 50l-7 35H130z" fill="#30272A"/>
      <path d="M139 119c2-26 15-42 39-42 25 0 40 19 40 45v37c0 29-17 50-40 51-25 1-41-22-41-50z" fill="#DA9875"/>
      <path d="M138 132c9-12 9-29 8-36 18 8 34-5 40-16 9 15 21 24 31 19v-21c-24-36-76-31-79 13z" fill="#30272A"/>
      <circle cx="131" cy="151" r="11" fill="#D18B6B"/><circle cx="219" cy="151" r="11" fill="#D18B6B"/>
      <path d="M152 140c7-5 14-5 19-1m20-1c7-5 15-3 19 2" stroke="#593B34" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="163" cy="151" r="3.3" fill="#332B2B"/><circle cx="200" cy="151" r="3.3" fill="#332B2B"/>
      <path d="M182 152l-4 13 6 2" stroke="#9F614F" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
      <path d="M165 179c10 9 23 9 33-1" stroke="#7A473D" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="150" cy="171" r="2" fill="#B47059"/><circle cx="154" cy="175" r="2" fill="#B47059"/>
      <circle cx="207" cy="171" r="2" fill="#B47059"/><circle cx="211" cy="175" r="2" fill="#B47059"/>
      <path d="M119 236l-20-18-20 14-1 17 50 24z" fill="#DB8A60"/>
      {/* Raised delivery bill: the actual source of Mina's dilemma. */}
      <g transform="rotate(-9 251 140)">
        <rect x="228" y="93" width="52" height="70" rx="5" fill="#FFF" stroke="#D7BA8F" strokeWidth="2"/>
        <path d="M235 108h37m-37 11h29m-29 10h36m-36 11h21" stroke="#D5D5D0" strokeWidth="3" strokeLinecap="round"/>
        <path d="M251 152l8-9 8 9" stroke="#C25C49" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
      <path d="M223 236l11-18 13 13-6 17z" fill="#DB8A60"/>
      <rect x="29" y="270" width="83" height="24" rx="12" fill="#FAE5B9"/>
      <text x="70" y="286" textAnchor="middle" fontSize="12" fontWeight="800" fontFamily="Arial,sans-serif" fill="#285F53">MINA&apos;S SHOP</text>
    </svg>
  );
}
