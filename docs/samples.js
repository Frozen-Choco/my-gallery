// Only typography examples are shared; compositions are style-specific.
const title='<h3 class="spec-title"><span lang="ja">サンプル</span><span lang="en">Sample</span></h3>';
const rule='<div class="spec-rule"></div>';
const art=kind=>`<div class="spec-art art-${kind}"><i></i><i></i><i></i></div>`;
export function sampleMarkup(style){
  const composition={
    minimal:()=>`${title}${art('line')}`,
    swiss:()=>`${rule}${art('circle')}${title}`,
    neobrutal:()=>`${title}${art('star')}`,
    editorial:()=>`${rule}<div class="editorial-page"><div>${title}</div>${art('sculpture')}</div>`,
    glass:()=>`<div class="glass-orb"></div><div class="glass-card">${title}</div>${art('orb')}`,
    bento:()=>`<div class="tile-board"><div class="tile-heading">${title}</div><div class="tile-art">${art('tile')}</div><div class="tile-description"><i class="tile-orbit"></i></div><div class="tile-swatch"><i></i><i></i><i></i></div></div>`,
    bauhaus:()=>`${art('geometry')}${title}`,
    organic:()=>`${art('leaves')}<div class="organic-paper">${title}</div>`,
    retro:()=>`<div class="retro-frame">${title}</div>${art('rainbow')}`,
    luxury:()=>`${art('rings')}<div class="luxury-center">${title}</div>`,
    neumorphism:()=>`<div class="neu-console">${title}<div class="neu-controls">${art('controls')}</div></div>`,
    material:()=>`<div class="material-rail"><i></i><i></i><i></i></div><div class="material-workspace">${title}${art('modules')}</div>`,
    cyber:()=>`${rule}${art('radar')}${title}`,
    memphis:()=>`${art('play')}${title}`,
    flat:()=>`<div class="flat-band"></div><div class="flat-body">${art('landscape')}<div>${title}</div></div>`,
    terminal:()=>`<div class="terminal-chrome"><i></i><i></i><i></i></div><div class="terminal-screen">${title}</div>`
  };
  return composition[style.id]();
}
