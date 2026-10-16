import {useId} from 'react';

const frozenLetters = [
  {letter:'冷', transform:'translate(57 104) rotate(-27)'},
  {letter:'凍', transform:'translate(130 79) rotate(-13)'},
];

export function Brand({header = false}: {header?: boolean}) {
  const id = useId();
  const outline = `${id}-outline`;
  return <a className={`brand${header ? ' brand-header' : ''}`} href="#home" aria-label="冷凍チョコ ギャラリー ホーム">
    <svg className="brand-art" viewBox="0 25 400 165" aria-hidden="true">
      <defs>
        <filter id={outline} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="2.4" result="wide"/>
          <feFlood floodColor="#fff3d6"/><feComposite in2="wide" operator="in"/>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {frozenLetters.map(({letter}, index) => <clipPath key={letter} id={`${id}-ice-${index}`}>
          <text x="-34" y="26" className="brand-frozen">{letter}</text>
        </clipPath>)}
      </defs>
      {frozenLetters.map(({letter, transform}, index) => <g key={letter} transform={transform} filter={`url(#${outline})`} className="brand-outlined">
        <text x="-34" y="26" className="brand-frozen brand-ice">{letter}</text>
        <g className="brand-facets" clipPath={`url(#${id}-ice-${index})`}>
          <path d="M-34 -38H4L-17 37H-44ZM23 -38H38L16 37H3Z" fill="#87bbca"/>
          <path d="M-8 -30L-19 -8L-8 5L-18 28" stroke="#e6f8fa" strokeWidth="1.5" fill="none"/>
        </g>
      </g>)}
      <g className="brand-outlined brand-chocolate-strokes" filter={`url(#${outline})`} fill="none" strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
        <g transform="translate(204 70) translate(-85 -147)"><path d="M67 128L103 119M61 143H108M86 124V150Q86 166 65 175"/></g>
        <g transform="translate(268 81) rotate(13) translate(-136 -150)"><path d="M119 131H151V173H118M119 152H150" strokeWidth="8"/></g>
        <g transform="translate(334 105) rotate(27) translate(-187 -147)"><path d="M166 120H203V173H166"/></g>
        <path className="brand-chocolate" d="M336 137C338 143 337 149 335 154C331 163 339 165 338 173C337 180 326 181 324 174C322 169 327 163 329 158C331 151 327 146 327 141Z" stroke="none"/>
      </g>
      <text className="brand-gallery" x="200" y="163" textAnchor="middle" fontSize="29" letterSpacing="4">ギャラリー</text>
    </svg>
  </a>;
}
