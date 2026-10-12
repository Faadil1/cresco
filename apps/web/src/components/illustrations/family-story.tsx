import { a11y } from "./palette";

type ArtProps = { className?: string; title?: string };

/**
 * Original hand-built SVG artwork for the CRESCO human-editorial direction.
 * No external images, no remote assets, no photos of real customers.
 * Decorative examples are not live transaction receipts.
 */
export function FamilyStoryScene({ className, title = "An illustrated parent and teenager exploring CRESCO together at home" }: ArtProps) {
  return (
    <svg viewBox="0 0 760 540" className={className} {...a11y(title)} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="story-wall" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffbf2"/><stop offset="1" stopColor="#e8e6ce"/></linearGradient>
        <linearGradient id="story-window" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffce3"/><stop offset="1" stopColor="#badbd2"/></linearGradient>
        <linearGradient id="story-skin-mom" x1="0" y1="0" x2=".95" y2="1"><stop stopColor="#f6bd88"/><stop offset=".65" stopColor="#e5a27d"/><stop offset="1" stopColor="#bf705c"/></linearGradient>
        <linearGradient id="story-skin-teen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f7c494"/><stop offset="1" stopColor="#d58c67"/></linearGradient>
        <linearGradient id="story-knit" x1="0" y1="0" x2=".85" y2="1"><stop stopColor="#4f8260"/><stop offset="1" stopColor="#264d39"/></linearGradient>
        <linearGradient id="story-hoodie" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c6b3ef"/><stop offset="1" stopColor="#8278b3"/></linearGradient>
        <linearGradient id="story-table" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#dbac79"/><stop offset="1" stopColor="#ae7652"/></linearGradient>
        <radialGradient id="story-light"><stop stopColor="#fff7c5" stopOpacity=".95"/><stop offset="1" stopColor="#fff7c5" stopOpacity="0"/></radialGradient>
        <filter id="story-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="13" stdDeviation="13" floodColor="#58412c" floodOpacity=".13"/></filter>
      </defs>
      <rect width="760" height="540" rx="35" fill="url(#story-wall)"/>
      <ellipse cx="565" cy="150" rx="290" ry="235" fill="url(#story-light)"/>
      {/* Window, late afternoon sun and room details */}
      <rect x="448" y="24" width="275" height="305" rx="18" fill="#fffaf1" stroke="#cfbca1" strokeWidth="12"/>
      <rect x="460" y="36" width="251" height="281" rx="10" fill="url(#story-window)"/>
      <path d="M462 228c72-55 128-32 248-82v171H462z" fill="#93b89c" opacity=".48"/>
      <path d="M585 36v281M460 151h251" stroke="#f8f4e7" strokeWidth="11"/>
      <path d="M618 38 713 162v67L555 38z" fill="#fffef4" opacity=".29"/>
      <rect x="56" y="70" width="114" height="148" rx="7" fill="#e0c6a4" stroke="#af8c66" strokeWidth="6" transform="rotate(-5 56 70)"/>
      <rect x="69" y="84" width="88" height="122" rx="3" fill="#f9f2da" transform="rotate(-5 69 84)"/>
      <path d="M104 181c-13-30 12-44 4-75m2 55c12-35 38-41 38-64" fill="none" stroke="#567b4a" strokeWidth="4" strokeLinecap="round"/>
      <path d="M105 140c-19-23-35-17-36-29 19-6 31 9 36 29zm7-8c5-22 18-29 34-28-3 14-15 24-34 28zm-1 27c-17-19-30-11-33-27 17-3 28 10 33 27z" fill="#79a16c"/>
      <path d="M0 334h760" stroke="#ddcbb7" strokeWidth="8"/>
      <path d="M28 344v-81m0 36c-31-40-25-68-14-84 32 21 28 52 14 84zm2-24c2-39 20-57 42-60 1 29-12 50-42 60z" fill="#698c59" stroke="#496e4b" strokeWidth="2"/>
      <path d="M724 368v-126m0 70c-42-41-39-72-29-90 37 16 45 50 29 90zm3-46c15-43 35-50 51-48-3 28-19 46-51 48z" fill="#59845c"/>
      <rect x="687" y="350" width="54" height="50" rx="9" fill="#cd966e"/>
      {/* Warm floor and couch */}
      <path d="M0 424c128-42 308-38 442-9 114 25 212 22 318-7v132H0z" fill="#dfd0bb"/>
      <rect x="178" y="312" width="518" height="135" rx="52" fill="#d6ba9a"/>
      <rect x="152" y="350" width="90" height="114" rx="38" fill="#d1ad8c"/>
      <rect x="666" y="354" width="88" height="116" rx="33" fill="#d1ad8c"/>
      {/* Parent: sweater, soft folds, shaped face, layered hair */}
      <path d="M174 468c-1-99 28-169 111-181 84-11 158 51 180 181z" fill="url(#story-knit)" filter="url(#story-shadow)"/>
      <path d="M205 459c30-62 25-112 70-132m64 135c-2-73 5-115 43-142" fill="none" stroke="#88a68b" strokeWidth="5" opacity=".32"/>
      <path d="M247 290c-24-48-11-101 1-132 18-48 56-69 107-53 45 14 68 47 55 102-6 37-23 82-46 98z" fill="#3b2b2b"/>
      <path d="M278 249c-14 8-25-5-24-25 0-14 10-22 21-18m116 1c12-7 22 5 21 22-1 18-10 29-22 20" fill="url(#story-skin-mom)"/>
      <path d="M275 181c5-33 29-52 65-53 37-1 60 24 60 62v42c-1 53-23 83-58 88-33 4-66-35-67-80z" fill="url(#story-skin-mom)"/>
      <path d="M266 198c-13-36-5-77 23-92 11-36 55-43 84-20 30 8 49 41 38 78-8 3-21-3-23-14-10-4-20-11-25-22-20 23-49 22-83 32-6 15-8 26-14 38z" fill="#342828"/>
      <path d="M281 163c25-40 70-59 106-29m-103 17c24-31 61-38 84-31" fill="none" stroke="#795247" strokeWidth="7" strokeLinecap="round" opacity=".72"/>
      <ellipse cx="388" cy="114" rx="29" ry="32" fill="#35282a"/>
      <path d="M303 215c8-7 18-7 26-2m30-1c9-6 19-6 25 0" fill="none" stroke="#583d32" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="319" cy="223" rx="3" ry="3.5" fill="#3f3130"/><ellipse cx="370" cy="220" rx="3" ry="3.5" fill="#3f3130"/>
      <path d="M345 227c-3 11-6 19 2 21m-22 17c13 10 27 9 42-1" fill="none" stroke="#9e614f" strokeWidth="3" strokeLinecap="round"/>
      <path d="M304 244c8 7 12 7 19 7m39-3c6 0 12-3 17-8" fill="none" stroke="#f8cfaa" strokeWidth="6" opacity=".28"/>
      <circle cx="400" cy="247" r="8" fill="none" stroke="#c99c54" strokeWidth="4"/>
      {/* Teen: hoodie with natural sleeves and curls */}
      <path d="M404 479c-1-89 27-158 107-164 100-10 165 56 171 164z" fill="url(#story-hoodie)" filter="url(#story-shadow)"/>
      <path d="M460 333c-3 21 26 41 67 45 47 3 84-13 95-37m-158 22c-19 35-23 68-22 112m175-111c23 35 29 69 32 111" stroke="#e1d2fa" strokeWidth="6" fill="none" opacity=".45"/>
      <path d="M481 289c-27-27-29-68-19-105 8-47 50-75 92-68 53 5 83 49 71 104-6 28-18 50-43 69z" fill="#422f2c"/>
      <path d="M481 207c0-43 20-69 68-71 47-2 69 32 68 70v35c-4 52-27 88-66 90-43 2-69-37-70-79z" fill="url(#story-skin-teen)"/>
      <path d="M477 205c-29-23-28-48-9-62-13-28 1-46 22-52 24-33 63-30 80-14 34-5 60 19 59 43 21 22 17 48-2 66-15-12-18-27-34-34-13 15-38 21-59 11-17 17-32 14-47 14-2 12-5 20-10 28z" fill="#392a28"/>
      <path d="M479 135c8-23 27-27 50-27m-1-18c14-10 30-5 39 5m16 13c18 7 24 17 22 29" fill="none" stroke="#745044" strokeWidth="10" strokeLinecap="round"/>
      <path d="M510 232c10-5 19-5 26 0m33-4c8-5 18-3 24 2" stroke="#5c443e" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <ellipse cx="526" cy="239" rx="3.1" ry="3.3" fill="#30292b"/><ellipse cx="582" cy="239" rx="3.1" ry="3.3" fill="#30292b"/>
      <path d="M557 245c-4 9-5 19 2 20m-29 19c15 10 33 11 49 1" fill="none" stroke="#aa6a55" strokeWidth="3" strokeLinecap="round"/>
      {/* Arms, phone and table in foreground */}
      <path d="M246 408c41-6 64 16 98 37l40 22-35 26-100-42z" fill="url(#story-knit)"/>
      <path d="M345 449c17-2 30 8 39 21l-6 19-34-17z" fill="url(#story-skin-mom)"/>
      <path d="M562 387c47-21 74 12 82 58l-31 21-70-38z" fill="url(#story-hoodie)"/>
      <path d="M551 413c15-8 34-5 44 8l-6 28-39-11z" fill="url(#story-skin-teen)"/>
      <rect x="544" y="349" width="65" height="112" rx="13" fill="#262b30" transform="rotate(10 544 349)" filter="url(#story-shadow)"/>
      <rect x="550" y="356" width="53" height="98" rx="10" fill="#34393f" transform="rotate(10 550 356)"/>
      <circle cx="574" cy="369" r="6" fill="#737b7e"/>
      <path d="M526 432c13-21 33-15 47-3l-2 24c-13 10-31-1-45-8z" fill="url(#story-skin-teen)"/>
      <path d="M0 469c205-13 445-12 760-18v89H0z" fill="url(#story-table)"/>
      <path d="M0 470c229-14 487-15 760-18" fill="none" stroke="#f6d3a0" strokeWidth="7"/>
      <path d="M8 509c192-23 426-12 744-24" stroke="#8c5d43" opacity=".17" strokeWidth="5" fill="none"/>
      <rect x="328" y="434" width="145" height="23" rx="4" fill="#db9261" transform="rotate(-2 328 434)"/>
      <rect x="343" y="416" width="140" height="22" rx="4" fill="#7886a4" transform="rotate(2 343 416)"/>
      <rect x="339" y="396" width="128" height="20" rx="4" fill="#718362" transform="rotate(-2 339 396)"/>
      <path d="M133 431h58l-6 54c-1 16-45 16-46 0z" fill="#faf5e7" stroke="#d2c4ab" strokeWidth="3"/>
      <path d="M191 445c23-3 25 23 0 29" fill="none" stroke="#faf5e7" strokeWidth="10"/>
      <path d="M163 466v-21m0 15c-14-17-19-9-17-24 10 2 17 10 17 24zm0-13c10-14 19-12 20-23-11 0-19 9-20 23z" fill="#689270" stroke="#689270" strokeWidth="2"/>
    </svg>
  );
}

export type StoryRole = "parent" | "teen" | "request" | "approved" | "capital";

export function StoryVignette({ role, className, title }: ArtProps & { role: StoryRole }) {
  const parent = role === "parent" || role === "approved";
  const capital = role === "capital";
  const tone = capital ? "#d7e8e4" : parent ? "#ead9c4" : "#e8e0f3";
  const shirt = capital ? "#245669" : parent ? "#37684b" : "#a18bd0";
  return (
    <svg viewBox="0 0 350 200" className={className} {...a11y(title ?? (capital ? "Illustrated capital operator at a desk" : parent ? "Illustrated parent using CRESCO" : "Illustrated teen using CRESCO"))}>
      <defs>
        <linearGradient id={`scene-warm-${role}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fffaf0"/><stop offset="1" stopColor={tone}/></linearGradient>
      </defs>
      <rect width="350" height="200" rx="24" fill={`url(#scene-warm-${role})`}/>
      <circle cx="280" cy="46" r="64" fill="#fffaf1" opacity=".68"/>
      <path d="M0 173c65-30 116-24 184-12s113-2 166-21v60H0z" fill="#d7cfb4" opacity=".45"/>
      <path d="M25 149V40m0 55C2 83 0 57 11 45c18 9 19 33 14 50zm0-18c9-33 29-37 39-30-8 23-20 27-39 30z" fill="#7f9e70"/>
      <path d="M242 200c-2-54 28-87 73-87 42 0 67 29 70 87z" fill={shirt}/>
      <path d="M270 134c-14-16-16-45-12-60 6-30 19-47 49-47 34 0 54 29 50 63-3 24-13 46-31 57z" fill="#342b29"/>
      <ellipse cx="308" cy="91" rx="37" ry="45" fill={parent?"#dfa77f":"#e5ae82"}/>
      <path d="M271 89c-3-36 13-59 44-60 31-1 49 23 45 58-9-12-14-24-21-34-18 14-42 10-57 25l-11 11z" fill="#382b2a"/>
      {parent?<ellipse cx="347" cy="42" rx="15" ry="17" fill="#382b2a"/>:null}
      <path d="M291 94c5-3 11-3 15 0m20 0c5-3 10-3 14 0" stroke="#5f3e35" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <circle cx="300" cy="99" r="2.5" fill="#3c302d"/><circle cx="331" cy="99" r="2.5" fill="#3c302d"/>
      <path d="M314 102c-3 8-4 11 1 13m-12 9c7 5 17 6 24 0" stroke="#a16d56" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M233 200c1-26 18-41 43-56l21 21-16 35z" fill={shirt}/>
      <path d="M261 177c13-10 27-11 40-2l5 23h-44z" fill="#e5ae82"/>
      <rect x="279" y="146" width="42" height="67" rx="7" fill="#343d45" transform="rotate(10 279 146)"/>
      <rect x="283" y="151" width="33" height="52" rx="3" fill="#5e7173" transform="rotate(10 283 151)"/>
      <path d="M0 188c140-11 242-4 350-13v25H0z" fill="#bf9472"/>
      <path d="M0 188c113-8 224-4 350-13" stroke="#e5bb90" strokeWidth="5" fill="none"/>
    </svg>
  );
}
