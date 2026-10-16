export function Brand() {
  return <a className="brand" href="./" aria-label="冷凍チョコ ギャラリー ホーム">
    <svg className="brand-art" viewBox="0 0 180 94" aria-hidden="true">
      <path d="M0 0H180V52H169Q162 52 162 59V78A6 6 0 0 1 150 78V59Q150 52 143 52H0Z" fill="currentColor"/>
    </svg>
    <span className="brand-name" aria-hidden="true">
      <span className="brand-top"><span className="brand-frozen">冷凍</span><span className="brand-cocoa">チョコ</span></span>
      <span className="brand-gallery">ギャラリー</span>
    </span>
  </a>;
}
