import {useId} from 'react';

export function Brand() {
  const id = useId();
  const letters = `${id}-frozen`, clip = `${id}-ice`, gradient = `${id}-gallery`;
  return <a className="brand" href="#home" aria-label="冷凍チョコ ギャラリー ホーム">
    <svg className="brand-art" viewBox="0 0 360 240" aria-hidden="true">
      <defs>
        <text id={letters} x="62" y="94" fontSize="65" letterSpacing="-3" className="brand-frozen">冷凍</text>
        <clipPath id={clip}><use href={`#${letters}`}/></clipPath>
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
      <path className="brand-chocolate" d="M168 120H203Q208 120 208 125V163C208 174 202 178 202 185C202 191 209 195 209 201C209 207 205 211 200 211C194 211 191 207 191 202C191 195 198 192 198 184C198 180 194 178 188 178H166A5 5 0 0 1 166 168H193Q198 168 198 163V130H168A5 5 0 0 1 168 120Z"/>
      <path className="brand-divider" d="M228 34V199" fill="none" stroke={`url(#${gradient})`} strokeWidth="1" opacity=".3"/>
      <g className="brand-gallery" fill="none" stroke={`url(#${gradient})`} strokeWidth="3.2" strokeLinejoin="miter" strokeLinecap="square">
        <path d="M246 42L267 39M245 51L268 48M254 34L259 60M265 30L268 34M272 29L275 33"/>
        <path d="M249 76L269 73L263 84M253 69L258 91"/>
        <path d="M248 103H266M246 111H268Q266 122 250 126"/>
        <path d="M248 139V151M267 137V150Q267 160 252 165"/>
        <path d="M257 178V199"/>
      </g>
    </svg>
  </a>;
}
