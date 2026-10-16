export function Brand() {
  return <a className="brand" href="./" aria-label="冷凍チョコ ギャラリー ホーム">
    <svg className="brand-art" viewBox="0 0 180 100" aria-hidden="true">
      <defs>
        <linearGradient id="brand-chocolate" x1="0" y1="0" x2=".25" y2="1">
          <stop stopColor="#986345"/><stop offset=".38" stopColor="#663b2b"/><stop offset="1" stopColor="#41271f"/>
        </linearGradient>
        <linearGradient id="brand-ice" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fff"/><stop offset="1" stopColor="#9bd8ed"/>
        </linearGradient>
      </defs>
      <path className="brand-chocolate-shadow" d="M17 15Q89 9 163 16Q174 17 174 29V49Q174 56 167 56H163Q158 56 158 62V73Q158 81 152 81Q146 81 146 73V59Q146 53 140 53H132Q126 53 126 60V88Q126 96 119 96Q112 96 112 88V67Q112 61 105 61H100Q94 61 94 55Q94 51 87 51H76Q70 51 70 58V70Q70 77 64 77Q58 77 58 70V60Q58 54 52 54H41Q34 54 34 61V81Q34 89 27 89Q20 89 20 81V58Q20 53 14 52Q6 51 6 42V29Q6 17 17 15Z" fill="url(#brand-chocolate)"/>
      <path d="M112 66V86Q112 93 118 93M147 61V71Q147 77 151 77M21 60V79Q21 85 25 85" fill="none" stroke="#b77c54" strokeOpacity=".4" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 21Q83 14 162 21" fill="none" stroke="#d7a17a" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round"/>
      <g fill="url(#brand-ice)" stroke="#dff7ff" strokeWidth=".7" strokeLinejoin="round">
        <path d="M20 18L24 10L33 12L38 7L46 12L51 10L58 17L55 21L48 19L45 26L42 18L34 20L28 17L25 25L23 19Z"/>
        <path d="M58 17L64 11L73 12L78 8L85 13L89 12L94 19L86 20L83 28L79 19L70 21L67 18L63 22Z"/>
        <path d="M29 49L32 60L35 49M65 49L68 57L71 49M80 49L83 62L86 49"/>
      </g>
      <path d="M31 12L37 10M65 14L73 15M79 11L83 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span className="brand-name" aria-hidden="true">
      <span className="brand-top"><span className="brand-frozen">冷凍</span><span className="brand-cocoa">チョコ</span></span>
      <span className="brand-gallery">ギャラリー</span>
    </span>
  </a>;
}
