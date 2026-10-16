import {useId} from 'react';

const frozenLetters = [
  {letter:'冷', transform:'translate(57 104) rotate(-27)'},
  {letter:'凍', transform:'translate(130 79) rotate(-13)'},
];

function ChocolateMark({outline = false, gloss}: {outline?: boolean; gloss?: string}) {
  return <g className={outline ? 'brand-outline-strokes' : 'brand-chocolate-strokes'} fill="none" strokeWidth={outline ? 18 : 10} strokeLinejoin="round" strokeLinecap="round">
    <g transform="translate(204 70) translate(-85 -147)"><path d="M67 128L103 119M61 143H108M86 124V150Q86 166 65 175"/></g>
    <g transform="translate(268 81) rotate(13) translate(-136 -150)"><path d="M119 131H151V173H118M119 152H150" strokeWidth={outline ? 16 : 8}/></g>
    <g transform="translate(334 105) rotate(27) translate(-187 -147)"><path d="M166 120H203V173H166"/></g>
    <path className={outline ? 'brand-outline-fill' : 'brand-drop'} fill={outline ? undefined : `url(#${gloss})`} d="M336 137C338 143 337 149 335 154C331 163 339 165 338 173C337 180 326 181 324 174C322 169 327 163 329 158C331 151 327 146 327 141Z" strokeWidth={outline ? 8 : 0}/>
  </g>;
}

function HeaderLogo({id}: {id: string}) {
  return <svg className="brand-art" viewBox="0 25 400 165" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-drop`} gradientUnits="userSpaceOnUse" x1="325" y1="156" x2="340" y2="172">
        <stop stopColor="#805136"/><stop offset=".35" stopColor="#c58a5b"/><stop offset=".7" stopColor="#95603c"/><stop offset="1" stopColor="#633b28"/>
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
      <path d="M332 159C331 164 327 168 328 172" stroke="#ffe5b8" strokeWidth="2.5"/>
      <path d="M331 176Q335 177 336 173" stroke="#d99c67" strokeWidth="1.5"/>
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
      <linearGradient id={`${id}-drop`} gradientUnits="userSpaceOnUse" x1="192" y1="181" x2="208" y2="207">
        <stop stopColor="#805136"/><stop offset=".45" stopColor="#bf8252"/><stop offset=".75" stopColor="#99603c"/><stop offset="1" stopColor="#633b28"/>
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
      <path d="M201 184C202 190 195 195 195 201" stroke="#ffe5b8" strokeWidth="2.8"/>
      <path d="M195 204L196 205" stroke="#fff0d3" strokeWidth="2.2"/>
      <path d="M201 208Q206 207 206 203" stroke="#d99c67" strokeWidth="1.7"/>
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
