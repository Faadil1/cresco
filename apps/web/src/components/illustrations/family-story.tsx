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
  const teen = role === "teen" || role === "request";
  const operator = role === "capital";
  const shirt = parent ? "#386a50" : teen ? "#8f78bb" : "#31576c";
  const skin = parent ? "#dfaa87" : teen ? "#e7b58d" : "#a97554";
  const palette = parent ? "#f1e2cb" : teen ? "#e8dcf3" : "#dbe9e4";
  const sceneId = `cresco-editorial-${role}`;
  const label = title ?? (operator
    ? "Illustrated professional reviewing a delegated financial mandate"
    : parent
      ? "Illustrated parent reviewing a CRESCO request at home"
      : "Illustrated teenager learning to make a decision with CRESCO");

  return (
    <svg
      viewBox="0 0 350 200"
      className={className}
      {...a11y(label)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${sceneId}-wall`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop stopColor="#fffaf1" />
          <stop offset="58%" stopColor={palette} />
          <stop offset="100%" stopColor="#e6d4b9" />
        </linearGradient>
        <radialGradient id={`${sceneId}-light`}>
          <stop stopColor="#fffdf0" stopOpacity=".96" />
          <stop offset="100%" stopColor="#fff8ea" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${sceneId}-skin`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop stopColor="#f6cda7" />
          <stop offset="46%" stopColor={skin} />
          <stop offset="100%" stopColor={parent ? "#bc785e" : teen ? "#ce8d70" : "#845039"} />
        </linearGradient>
        <linearGradient id={`${sceneId}-cloth`} x1="0%" y1="0%" x2="95%" y2="100%">
          <stop stopColor={parent ? "#56856b" : teen ? "#b6a4df" : "#547f90"} />
          <stop offset="100%" stopColor={shirt} />
        </linearGradient>
        <linearGradient id={`${sceneId}-wood`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop stopColor="#e9be94" />
          <stop offset="100%" stopColor="#bc8662" />
        </linearGradient>
        <filter id={`${sceneId}-soft-shadow`} x="-35%" y="-35%" width="170%" height="190%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#564030" floodOpacity=".15" />
        </filter>
      </defs>

      <rect width="350" height="200" rx="24" fill={`url(#${sceneId}-wall)`} />
      <ellipse cx="263" cy="49" rx="139" ry="93" fill={`url(#${sceneId}-light)`} />
      <path d="M0 142c65-11 121-12 177-3 70 13 116-4 173-12v73H0z" fill="#dfd5bf" opacity=".55" />

      {/* Familiar home details and a small sense of place, never mock financial evidence. */}
      <rect x="197" y="11" width="135" height="120" rx="8" fill="#fffaf0" stroke="#dccbb5" strokeWidth="5" opacity=".65" />
      <rect x="206" y="20" width="117" height="101" rx="3" fill="#f5f3da" opacity=".8" />
      <path d="M264 20v101M206 70h117" stroke="#fff9ec" strokeWidth="5" opacity=".78" />
      <path d="M206 97c32-20 60-20 117-36v60H206z" fill="#acd0ae" opacity=".45" />
      <path d="M20 160V72m0 53C1 112-1 95 7 82c18 6 20 24 13 43zm1-23c7-24 23-29 33-25-4 18-14 25-33 25z" stroke="#5c845e" strokeWidth="2.5" fill="#789e72" strokeLinejoin="round" />
      <rect x="4" y="156" width="31" height="27" rx="5" fill="#dca886" />
      <ellipse cx="19" cy="182" rx="21" ry="4" fill="#8e705d" opacity=".15" />
      <path d="M59 157h88" stroke="#9a9b87" strokeWidth="3" opacity=".4" />
      <rect x="63" y="128" width="44" height="31" rx="4" fill="#d2bda2" opacity=".4" />
      <path d="M71 135h30m-30 7h22m-22 7h18" stroke="#fffaf0" opacity=".7" strokeWidth="2.5" strokeLinecap="round" />

      {/* Dimensional figure, with independent adult / adolescent / operator poses. */}
      <ellipse cx="274" cy="189" rx="88" ry="10" fill="#82634d" opacity=".14" />
      <g filter={`url(#${sceneId}-soft-shadow)`}>
        <path d="M189 202c-2-24 4-47 22-62 13-11 32-16 58-16 26 0 47 7 60 23 11 14 17 33 17 55z" fill={`url(#${sceneId}-cloth)`} />
        <path d="M208 149c7 15 10 33 10 52m110-50c-11 17-13 29-14 50" fill="none" stroke="#fff9eb" strokeWidth="2.5" strokeOpacity=".2" />
        {teen ? (
          <>
            <path d="M237 136c13 10 41 15 69 0l-14-12-47-1z" fill="#d5c8ed" stroke="#ede5fa" strokeWidth="2" />
            <path d="M241 150c5 9 16 14 27 15 15-1 26-6 32-15M270 162v41" fill="none" stroke="#e8dcfa" strokeWidth="2.5" opacity=".5" />
            <path d="M248 158l-7 17m51-17 7 17" fill="none" stroke="#eee4fd" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : operator ? (
          <>
            <path d="M236 132l30 28-13 37-27-54zm62-1l-33 29 15 38 30-56z" fill="#23445b" opacity=".7" />
            <path d="M251 134l15 23 15-23-5-6h-22z" fill="#f0ede5" />
            <path d="M264 158l-6 29 9 12 8-12-7-29z" fill="#aa9bc9" />
          </>
        ) : (
          <>
            <path d="M237 134c11 7 20 15 32 16 11-1 24-9 35-17" stroke="#9cbd9b" strokeWidth="3" fill="none" opacity=".6" />
            <path d="M270 150c-3 15-1 31 1 51" stroke="#244c38" strokeWidth="2.5" fill="none" opacity=".35" />
          </>
        )}
      </g>

      {/* Hair behind face: material highlights create volume rather than a flat silhouette. */}
      <path d="M223 80c-13-37 12-64 44-65 41-2 62 26 58 61-1 18-9 31-21 40l-61 2c-18-11-23-24-20-38z" fill={operator ? "#302826" : "#3d2a29"} />
      {parent ? (
        <>
          <ellipse cx="317" cy="28" rx="22" ry="24" fill="#342829" />
          <path d="M300 28c10-14 27-13 33 0" stroke="#6e4b40" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M227 70c0-27 21-52 48-50" stroke="#725043" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".8" />
        </>
      ) : teen ? (
        <>
          <path d="M227 60c-10-14 1-25 14-26 3-22 25-27 38-18 21-9 38 8 37 27 16 10 11 32 2 36-7-18-19-28-34-32-21 11-37 9-57 13z" fill="#342829" />
          <path d="M235 46c11-13 22-14 34-11m12-8c13-5 24 1 29 14" stroke="#775145" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M225 69c-3-27 17-50 42-54 24-6 46 15 49 39-18-6-23-15-29-23-17 16-38 18-62 38z" fill="#292524" />
          <path d="M236 44c14-21 35-25 51-20" stroke="#6e5147" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Face: shaped chin, cheek gradients, eyelids, brow, nose and natural smile. */}
      <path d="M236 59c3-23 24-33 46-30 26 2 37 22 36 49l-3 23c-4 25-20 42-42 44-23 0-38-23-40-47z" fill={`url(#${sceneId}-skin)`} />
      <path d="M239 74c2-20 18-33 34-36" stroke="#ffdfb9" strokeWidth="7" strokeLinecap="round" opacity=".28" fill="none" />
      <path d="M307 79c2 22-8 39-19 47" stroke="#935d4e" strokeWidth="7" strokeLinecap="round" opacity=".16" fill="none" />
      <ellipse cx="236" cy="99" rx="7" ry="13" fill={skin} />
      <ellipse cx="316" cy="97" rx="6" ry="11" fill={skin} />
      <ellipse cx="252" cy="102" rx="12" ry="8" fill="#c36e65" opacity=".1" />
      <ellipse cx="303" cy="100" rx="10" ry="8" fill="#c36e65" opacity=".1" />
      <path d="M244 83c6-5 13-5 19-2m27 0c6-4 13-4 18 1" stroke="#604237" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M249 90c4-3 8-3 11 0m32 0c4-3 8-3 11 0" stroke="#66473e" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <ellipse cx="255" cy="91" rx="2.3" ry="2.5" fill="#352b2b" />
      <ellipse cx="298" cy="91" rx="2.3" ry="2.5" fill="#352b2b" />
      <path d="M277 94c-3 8-5 15-1 17 2 2 6 2 8 0" stroke="#ab7260" strokeWidth="2.3" fill="none" strokeLinecap="round" />
      <path d="M264 122c9 6 20 7 30-1" stroke="#925246" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M268 127c8 3 15 3 22 0" stroke="#f4c5a6" strokeWidth="2" fill="none" opacity=".55" />
      {operator ? <path d="M240 87h26m19 0h27m-46 0h19" stroke="#354554" strokeWidth="2" fill="none" opacity=".8" /> : null}
      {parent ? <circle cx="315" cy="104" r="4" stroke="#d5b368" strokeWidth="2" fill="none" /> : null}

      {/* Hand, sleeve, and tactile phone device — no simulated transaction state. */}
      <path d="M301 160c13-12 27-11 43 7l6 33h-60z" fill={`url(#${sceneId}-cloth)`} />
      <path d="M313 167c12-4 22-1 28 5" stroke="#e9e4cf" strokeWidth="2" opacity=".34" fill="none" />
      <rect x="295" y="147" width="35" height="57" rx="6" fill="#2c3742" transform="rotate(8 295 147)" />
      <rect x="299" y="151" width="27" height="47" rx="4" fill="#647b83" transform="rotate(8 299 151)" />
      <circle cx="314" cy="156" r="2.5" fill="#adbbc0" />
      <path d="M294 181c6-10 15-12 25-7l-1 19-26 6z" fill={`url(#${sceneId}-skin)`} />
      <path d="M295 180c4-4 8-5 13-5" stroke="#f7d4b5" strokeWidth="2.4" opacity=".55" fill="none" strokeLinecap="round" />

      {/* Warm foreground and grounding, soft grain implied through fine strokes. */}
      <path d="M0 187c117-7 216-9 350-11v24H0z" fill={`url(#${sceneId}-wood)`} />
      <path d="M0 187c118-10 218-9 350-11" stroke="#f4d3a9" strokeWidth="4" fill="none" />
      <path d="M23 196c74-4 135-6 211-6" stroke="#956f54" strokeOpacity=".12" strokeWidth="2.5" fill="none" />
    </svg>
  );
}
