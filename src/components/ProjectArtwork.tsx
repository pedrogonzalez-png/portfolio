/**
 * Original decorative concept artwork for the three allowlisted projects.
 * These are illustrations, NOT screenshots or published demos.
 */
function AbismoArtwork() {
  return (
    <svg viewBox="0 0 640 310" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="abismo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#120f20"/>
          <stop offset=".63" stopColor="#381821"/>
          <stop offset="1" stopColor="#130d17"/>
        </linearGradient>
        <radialGradient id="abismo-gate">
          <stop stopColor="#f9a65a"/>
          <stop offset=".25" stopColor="#d9583f" stopOpacity=".9"/>
          <stop offset="1" stopColor="#a72842" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="abismo-floor" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#45232e"/>
          <stop offset="1" stopColor="#0a0811"/>
        </linearGradient>
      </defs>
      <rect width="640" height="310" fill="url(#abismo-sky)"/>
      <path d="M0 0H155L225 100L170 160L100 130L0 208Z" fill="#160d1c"/>
      <path d="M640 0H460L420 77L476 160L560 111L640 177Z" fill="#120c19"/>
      <path d="M0 119L97 83L164 150L115 215L0 231ZM640 109L562 70L479 153L528 222L640 249Z" fill="#271422"/>
      <path d="M0 214L128 197L251 233L319 207L406 230L529 194L640 223V310H0Z" fill="url(#abismo-floor)"/>
      <ellipse cx="320" cy="166" rx="137" ry="140" fill="url(#abismo-gate)" opacity=".95"/>
      <path d="M264 207V119Q264 62 320 62Q377 62 377 119V207Z" fill="#100b17" stroke="#a95048" strokeWidth="3"/>
      <path d="M280 207V127Q280 79 320 79Q360 79 360 127V207Z" fill="#261420"/>
      <path d="M296 203V122Q296 96 320 96Q344 96 344 122V203Z" fill="#e16a4b" opacity=".67"/>
      <path d="M308 206V120Q308 109 320 109Q331 109 331 120V206Z" fill="#f5ac6a" opacity=".88"/>
      <path d="M312 222L316 163L321 160L326 164L329 222Z" fill="#15101b"/>
      <path d="M311 179L323 178L336 188L329 191L320 186L309 186Z" fill="#17111c"/>
      <path d="M319 159L322 121L325 159Z" fill="#f3b17c"/>
      <path d="M201 310L297 223L310 223L273 310ZM438 310L345 222L330 223L363 310Z" fill="#100b14"/>
      <path d="M0 279L149 230L238 273L188 310H0ZM640 270L519 224L419 275L456 310H640Z" fill="#281520" opacity=".85"/>
      {Array.from({length:20},(_,i)=> <rect key={i} x={30+i*29} y={212+Math.sin(i*4.7)*55} width={i%3===0?3:2} height={i%3===0?3:2} fill="#e7a26e" opacity={.15+(i%5)*.13}/>)}
      <g fontFamily="monospace" fontSize="11" letterSpacing="2" fill="#e6aa85">
        <text x="27" y="38" opacity=".9">ABISMO / WORLD 01</text>
        <text x="27" y="282" opacity=".55">PHASER — PROCEDURAL</text>
      </g>
      <path d="M24 46H155M24 54H90" stroke="#ba6a65" strokeWidth="1.5" opacity=".58"/>
      <path d="M524 25h90v2h-90zM572 31h42v2h-42z" fill="#ad6460" opacity=".45"/>
    </svg>
  );
}

function Site3DArtwork() {
  return (
    <svg viewBox="0 0 640 310" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="site-bg">
          <stop stopColor="#373251"/>
          <stop offset=".65" stopColor="#191729"/>
          <stop offset="1" stopColor="#0e101d"/>
        </radialGradient>
        <linearGradient id="site-portrait" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#bb9897"/>
          <stop offset=".4" stopColor="#766183"/>
          <stop offset="1" stopColor="#322742"/>
        </linearGradient>
        <linearGradient id="site-outline" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f5c68e"/>
          <stop offset="1" stopColor="#91546a"/>
        </linearGradient>
      </defs>
      <rect width="640" height="310" fill="url(#site-bg)"/>
      <g stroke="#81799e" strokeWidth="1.2" fill="none" opacity=".42">
        <ellipse cx="322" cy="234" rx="277" ry="66"/>
        <ellipse cx="322" cy="234" rx="210" ry="49"/>
        <ellipse cx="322" cy="234" rx="136" ry="34"/>
        <path d="M48 228Q325-39 591 226M95 245Q327 17 549 244" strokeDasharray="6 12"/>
      </g>
      <g opacity=".65" transform="translate(82 70) rotate(-12 48 95)">
        <rect width="96" height="170" rx="11" fill="#2d243a" stroke="#6a5773" strokeWidth="2"/>
        <circle cx="48" cy="70" r="23" fill="#6b5b76"/>
        <path d="M14 157Q18 103 48 109Q81 106 84 157Z" fill="#4b405e"/>
        <path d="M13 13H60" stroke="#cc9e8f" opacity=".7"/>
      </g>
      <g opacity=".7" transform="translate(458 74) rotate(12 48 95)">
        <rect width="95" height="165" rx="11" fill="#2c293a" stroke="#7f617a" strokeWidth="2"/>
        <circle cx="47" cy="66" r="22" fill="#98707c"/>
        <path d="M10 153Q19 106 47 106Q79 104 86 153Z" fill="#654354"/>
        <path d="M12 12H56" stroke="#dba9a5" opacity=".7"/>
      </g>
      <g transform="translate(236 30)">
        <rect width="168" height="226" rx="14" fill="#211a2c" stroke="url(#site-outline)" strokeWidth="3"/>
        <rect x="7" y="7" width="154" height="211" rx="10" fill="url(#site-portrait)"/>
        <ellipse cx="85" cy="89" rx="49" ry="58" fill="#453449" opacity=".6"/>
        <path d="M63 99Q52 66 71 50Q103 31 113 67L105 112Z" fill="#342b42"/>
        <ellipse cx="86" cy="90" rx="27" ry="37" fill="#c8a2a0"/>
        <path d="M57 94Q52 48 87 44Q119 42 112 96L106 79L96 64L73 88Z" fill="#31263c"/>
        <path d="M13 217Q19 149 86 149Q143 151 154 217Z" fill="#56405a"/>
        <path d="M42 179L85 204L129 178" fill="none" stroke="#c6a2a0" strokeWidth="5" opacity=".8"/>
        <rect x="14" y="12" width="48" height="4" rx="2" fill="#e7c2aa" opacity=".7"/>
        <circle cx="145" cy="15" r="4" fill="#e7c2aa"/>
      </g>
      <g fill="#f6cc9c">
        <path d="M207 151L192 164L207 176" fill="none" stroke="#f6cc9c" strokeWidth="3"/>
        <path d="M434 151L448 164L434 176" fill="none" stroke="#f6cc9c" strokeWidth="3"/>
      </g>
      <text x="28" y="33" fontSize="11" letterSpacing="2.4" fontFamily="monospace" fill="#c9b8cf">INTERACTIVE / CAROUSEL</text>
      <text x="518" y="281" fontSize="11" letterSpacing="2.3" fontFamily="monospace" fill="#c9b8cf">REACT 19</text>
      <circle cx="304" cy="278" r="3" fill="#a68da4"/><circle cx="320" cy="278" r="4" fill="#efb580"/><circle cx="337" cy="278" r="3" fill="#a68da4"/>
    </svg>
  );
}

function ThemeArtwork() {
  const shades = ["#C96A42", "#C85F64", "#9B82D5", "#6BAFC6", "#EC6179"];
  return (
    <svg viewBox="0 0 640 310" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hypr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1e1627"/><stop offset=".6" stopColor="#301c2b"/><stop offset="1" stopColor="#12131f"/>
        </linearGradient>
        <radialGradient id="hypr-wall"><stop stopColor="#aa634d" stopOpacity=".84"/><stop offset="1" stopColor="#5a2644" stopOpacity=".08"/></radialGradient>
      </defs>
      <rect width="640" height="310" fill="url(#hypr-bg)"/>
      <g transform="translate(56 22)">
        <rect width="530" height="250" rx="13" fill="#0d0c15" stroke="#8d6674" strokeWidth="2"/>
        <rect x="9" y="10" width="512" height="230" rx="8" fill="#241723"/>
        <rect x="9" y="10" width="512" height="230" fill="url(#hypr-wall)"/>
        <path d="M120 238Q245-39 404 239" fill="none" stroke="#cf866e" strokeWidth="2" opacity=".4"/>
        <path d="M220 240Q265-16 300 240" fill="none" stroke="#f2ae80" strokeWidth="1" opacity=".45"/>
        <rect x="20" y="20" width="490" height="19" rx="8" fill="#0f0d19" opacity=".9"/>
        <g fontFamily="monospace" fontSize="9" fill="#e5c4af">
          <text x="29" y="33">✦  WORKSPACE  01   02   03</text>
          <text x="403" y="33">THEME / CHANGLI</text>
        </g>
        <g>
          <rect x="29" y="55" width="184" height="133" rx="9" fill="#1b1520" stroke="#986a68" strokeWidth="1.5"/>
          <rect x="29" y="55" width="184" height="19" rx="9" fill="#503138"/>
          <circle cx="43" cy="65" r="3" fill="#f1a97a"/><circle cx="54" cy="65" r="3" fill="#a77070"/>
          <text x="40" y="92" fontSize="10" fontFamily="monospace" fill="#e3b37a">pedro@arch ~</text>
          <text x="40" y="110" fontSize="11" fontFamily="monospace" fill="#e8dacd">$ neofetch</text>
          <path d="M44 127h62m-62 10h110m-110 10h88m-88 10h103" stroke="#ac7c82" opacity=".65" strokeWidth="3"/>
          <path d="M133 112l18 32-34 0Z" fill="none" stroke="#c96a42" strokeWidth="3"/>
        </g>
        <g>
          <rect x="301" y="56" width="188" height="76" rx="8" fill="#221724" stroke="#916c76"/>
          <text x="316" y="77" fontSize="10" fontFamily="monospace" fill="#d8bba4">DESKTOP / WIDGET</text>
          <text x="316" y="109" fontSize="30" fontFamily="monospace" fill="#e3b37a">08:24</text>
          <rect x="301" y="143" width="188" height="56" rx="8" fill="#291a2c" stroke="#9e6875"/>
          <path d="M319 169L333 159L348 178L366 154L387 172L402 158L427 166L459 151" fill="none" stroke="#da846c" strokeWidth="3"/>
          <text x="319" y="191" fontSize="9" fill="#e3b37a" fontFamily="monospace">WIDGET / GRAPH</text>
        </g>
        <rect x="197" y="209" width="157" height="23" rx="11" fill="#211923" stroke="#6a4a53"/>
        {Array.from({length:5},(_,i)=><rect key={i} x={212+i*28} y="214" width="13" height="13" rx="4" fill={shades[i]}/>)}
      </g>
      <g fontFamily="monospace" letterSpacing="2.1" fontSize="10" fill="#d9b89f">
        <text x="26" y="292">HYPRLAND / THEMES</text>
        <text x="498" y="292">05 STYLES</text>
      </g>
    </svg>
  );
}

export function ProjectArtwork({ projectId }: { projectId: string }) {
  return (
    <span className={"card-artwork card-artwork--" + projectId} aria-hidden="true">
      {projectId === "abismo" ? <AbismoArtwork /> : projectId === "site-3d" ? <Site3DArtwork /> : <ThemeArtwork />}
      <span className="card-artwork-sheen" />
      <span className="card-artwork-label">CONCEPT VISUAL <span aria-hidden="true">✦</span></span>
    </span>
  );
}
