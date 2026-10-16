import {useId} from 'react';

const frozenLetters = [
  {letter:'冷', transform:'translate(57 104) rotate(-27)'},
  {letter:'凍', transform:'translate(130 79) rotate(-13)'},
];

function ChocolateMark({outline = false, gloss}: {outline?: boolean; gloss?: string}) {
  return <g className={outline ? 'brand-outline-strokes' : 'brand-chocolate-strokes'} fill="none" strokeWidth={outline ? 18 : 10} strokeLinejoin="round" strokeLinecap="round">
    <g transform="translate(204 70) translate(-85 -147)"><path d="M67 128L103 119M61 143H108M86 124V150Q86 166 65 175"/></g>
    <g transform="translate(268 81) rotate(13) translate(-136 -150)"><path d="M119 131H151V173H118M119 152H150" strokeWidth={outline ? 16 : 8}/></g>
    <path className={outline ? 'brand-outline-fill' : 'brand-drop'} fill={outline ? undefined : `url(#${gloss})`} d="M329.8 66.9L362.8 83.7Q367.2 86 364.9 90.5L341 137.5C338 143 334 147 334 153C334 160 340 166 339 173C338 184 323 185 322 175C321 169 327 163 328 157C330 148 326 141 319 137L301.2 123.1Q296.8 120.8 299 116.4Q301.3 112 305.8 114.2L334.3 128.7L353.8 90.4L325.3 75.9Q320.8 73.6 323.1 69.1Q325.4 64.7 329.8 66.9Z" strokeWidth={outline ? 8 : 0}/>
  </g>;
}

function HeaderLogo({id}: {id: string}) {
  return <svg className="brand-art" viewBox="0 25 400 165" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-drop`} gradientUnits="userSpaceOnUse" x1="327" y1="165" x2="338" y2="179">
        <stop stopColor="#805136"/><stop offset=".55" stopColor="#70442e"/><stop offset="1" stopColor="#ba8155"/>
      </linearGradient>
      {frozenLetters.map(({letter}, index) => <clipPath key={letter} id={`${id}-ice-${index}`}>
      <text x="-34" y="26" className="brand-frozen">{letter}</text>
    </clipPath>)}</defs>
    {frozenLetters.map(({letter, transform}, index) => <g key={letter} transform={transform}>
      <text x="-34" y="26" className="brand-frozen brand-ice brand-ice-outlined">{letter}</text>
      <g className="brand-facets" clipPath={`url(#${id}-ice-${index})`}>
        <path d="M-34 -38H4L-17 37H-44ZM23 -38H38L16 37H3Z" fill="#87bbca"/>
        <path d="M-8 -30L-19 -8L-8 5L-18 28" stroke="#e6f8fa" strokeWidth="1.5" fill="none"/>
      </g>
    </g>)}
    <ChocolateMark outline/>
    <ChocolateMark gloss={`${id}-drop`}/>
    <g className="brand-drop-glints" fill="none" strokeLinecap="round">
      <path d="M336 174C336 178 333 180 329 178" stroke="#ffe5b8" strokeWidth="2"/>
    </g>
    <text className="brand-gallery" x="200" y="163" textAnchor="middle" fontSize="29" letterSpacing="4">ギャラリー</text>
  </svg>;
}

function SidebarLogo({id}: {id: string}) {
  const letters = `${id}-frozen`, clip = `${id}-ice`, gradient = `${id}-gallery`;
  return <svg className="brand-art" viewBox="0 0 360 240" aria-hidden="true">
    <defs>
      <text id={letters} x="62" y="94" fontSize="65" letterSpacing="-3" className="brand-frozen">冷凍</text>
      <clipPath id={clip}><use href={`#${letters}`}/></clipPath>
      <linearGradient id={`${id}-drop`} gradientUnits="userSpaceOnUse" x1="195" y1="196" x2="208" y2="212">
        <stop stopColor="#805136"/><stop offset=".55" stopColor="#70442e"/><stop offset="1" stopColor="#ba8155"/>
      </linearGradient>
      <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" y1="34" x2="0" y2="199">
        <stop offset="0" stopColor="#477a8b"/><stop offset=".48" stopColor="#72786b"/><stop offset="1" stopColor="#805136"/>
      </linearGradient>
    </defs>
    <g transform="translate(-20 -17) scale(1.23)">
      <use href={`#${letters}`} className="brand-ice"/>
      <g className="brand-facets" clipPath={`url(#${clip})`}>
        <path d="M56 32H126L97 101H53ZM172 31H202L172 103H149Z" fill="#85b9cb"/>
        <path d="M131 26L106 65L119 76L104 106M194 43L166 70L177 82" fill="none" stroke="#e6f5f5" strokeWidth="1.8"/>
      </g>
    </g>
    <g className="brand-chocolate-strokes" fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
      <path d="M67 128L103 119M61 143H108M86 124V150Q86 166 65 175"/>
      <path d="M126 137H148V170H124M125 154H147" strokeWidth="8"/>
    </g>
    <path className="brand-drop" fill={`url(#${id}-drop)`} d="M168 120H203Q208 120 208 125V163C208 174 202 178 202 185C202 191 209 195 209 201C209 207 205 211 200 211C194 211 191 207 191 202C191 195 198 192 198 184C198 180 194 178 188 178H166A5 5 0 0 1 166 168H193Q198 168 198 163V130H168A5 5 0 0 1 168 120Z"/>
    <g className="brand-drop-glints" fill="none" strokeLinecap="round">
      <path d="M206 201C207 206 203 210 199 208" stroke="#ffe5b8" strokeWidth="2.4"/>
    </g>
    <path d="M228 34V199" fill="none" stroke={`url(#${gradient})`} strokeWidth="1" opacity=".3"/>
    <g className="brand-side-gallery" fill="none" stroke={`url(#${gradient})`} strokeWidth="3.2" strokeLinejoin="miter" strokeLinecap="square">
      <path d="M246 42L267 39M245 51L268 48M254 34L259 60M265 30L268 34M272 29L275 33"/>
      <path d="M249 76L269 73L263 84M253 69L258 91"/>
      <path d="M248 103H266M246 111H268Q266 122 250 126"/>
      <path d="M248 139V151M267 137V150Q267 160 252 165"/>
      <path d="M257 178V199"/>
    </g>
  </svg>;
}

export function Brand({header = false}: {header?: boolean}) {
  const id = useId();
  return <a className={`brand${header ? ' brand-header' : ''}`} href="#home" aria-label="冷凍チョコ ギャラリー ホーム">
    {header ? <HeaderLogo id={id}/> : <SidebarLogo id={id}/>}
  </a>;
}
