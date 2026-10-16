import {useId} from 'react';

export function Brand({header = false}: {header?: boolean}) {
  const id = useId();
  const letters = `${id}-frozen`, clip = `${id}-ice`, gradient = `${id}-gallery`, outline = `${id}-chocolate-outline`;
  return <a className={`brand${header ? ' brand-header' : ''}`} href="#home" aria-label="冷凍チョコ ギャラリー ホーム">
    <svg className="brand-art" viewBox={header ? "35 -5 265 220" : "0 0 360 240"} preserveAspectRatio={header ? "xMaxYMid meet" : undefined} aria-hidden="true">
      <defs>
        <text id={letters} x="62" y="94" fontSize="65" letterSpacing="-3" className="brand-frozen">冷凍</text>
        <clipPath id={clip}><use href={`#${letters}`}/></clipPath>
        <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" y1="34" x2="0" y2="199">
          <stop offset="0" stopColor="#477a8b"/><stop offset=".48" stopColor="#72786b"/><stop offset="1" stopColor="#805136"/>
        </linearGradient>
        {header && <filter id={outline} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="expanded"/>
          <feFlood floodColor="#fff3d6"/>
          <feComposite in2="expanded" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>}
      </defs>
      <g transform={header ? "translate(-15 15) rotate(-30 145 65)" : undefined}>
      <g transform="translate(-20 -17) scale(1.23)">
        <use href={`#${letters}`} className="brand-ice"/>
        <g className="brand-facets" clipPath={`url(#${clip})`}>
          <path d="M56 32H126L97 101H53ZM172 31H202L172 103H149Z" fill="#85b9cb"/>
          <path d="M131 26L106 65L119 76L104 106M194 43L166 70L177 82" fill="none" stroke="#e6f5f5" strokeWidth="1.8"/>
        </g>
      </g>
      </g>
      <g transform={header ? "translate(76 -26)" : undefined} filter={header ? `url(#${outline})` : undefined}>
      <g className="brand-chocolate-strokes" fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
        <path d="M67 128L103 119M61 143H108M86 124V150Q86 166 65 175"/>
        <path d="M126 137H148V170H124M125 154H147" strokeWidth="8"/>
      </g>
      <path className="brand-chocolate" d="M168 120H203Q208 120 208 125V163C208 174 202 178 202 185C202 191 209 195 209 201C209 207 205 211 200 211C194 211 191 207 191 202C191 195 198 192 198 184C198 180 194 178 188 178H166A5 5 0 0 1 166 168H193Q198 168 198 163V130H168A5 5 0 0 1 168 120Z"/>
      </g>
      {!header && <path className="brand-divider" d="M228 34V199" fill="none" stroke={`url(#${gradient})`} strokeWidth="1" opacity=".3"/>}
      <g className="brand-gallery" transform={header ? "translate(-60 45)" : undefined} fill="none" stroke={header ? "currentColor" : `url(#${gradient})`} strokeWidth="3.2" strokeLinejoin="miter" strokeLinecap="square">
        <path transform={header ? "translate(-115 101)" : undefined} d="M246 42L267 39M245 51L268 48M254 34L259 60M265 30L268 34M272 29L275 33"/>
        <path transform={header ? "translate(-69 68)" : undefined} d="M249 76L269 73L263 84M253 69L258 91"/>
        <path transform={header ? "translate(-26 31)" : undefined} d="M248 103H266M246 111H268Q266 122 250 126"/>
        <path transform={header ? "translate(17 -5)" : undefined} d="M248 139V151M267 137V150Q267 160 252 165"/>
        <path d={header ? "M305 146H328" : "M257 178V199"}/>
      </g>
    </svg>
  </a>;
}
