import type {MotionStyle, CatalogItem} from '../types';
export const motionFilters=['すべて','反応','登場','強調'];
const entry=(id: string,name: string,ja: string,category: string[],tags: string[],description: string,traits: string[],use: string,avoid: string,duration: number): MotionStyle=>({id,name,ja,category,tags,description,traits,use,avoid,duration});
export const motions=[
entry('mo-hover','Lift','浮き上がり',['反応'],['hover','浮く','影','ボタン'], '少し浮かせて、注目や状態の変化を伝える。',['上へ移動して、要素が浮くように見せる','移動先で止まり、状態の変化を伝える','ホバー、選択、登場などをきっかけに適用できる'],'ボタン、リンクカード、選択肢','移動量を小さくし、触れた要素がポインタから逃げないようにする。',1000),
entry('mo-underline','Underline Reveal','下線',['反応'],['リンク','hover','線','下線'], '下線を伸ばし、リンクの選択状態を軽く示す。',['左から右へ下線が伸びる','伸びきった位置で止まり、選択や強調を示す','文字の位置や大きさを変えない'],'テキストリンク、ナビゲーション','下線の有無だけで操作可能性を伝えず、文字色やフォーカス表示も整える。',1000),
entry('mo-gauge','Circular Fill','円形ゲージ',['反応'],['hover','円形','ゲージ','リング','進捗'], '円周に沿ってゲージが満ち、進行や選択を示す。',['上から時計回りに線が伸び、図を一周する','一周した状態を保ち、完了や選択を示す','ホバー、選択、処理の進捗などに合わせて使える'],'アイコン、選択項目、進捗表示','実際の進捗表示に使う場合は、処理の進み具合とゲージを一致させる。',700),
entry('mo-fade','Fade In','フェード',['登場'],['opacity','透明','現れる'], '透明からゆっくり現れる、控えめな登場表現。',['位置を動かさず、不透明度だけを変える','周囲の要素を押し動かさない','移動を伴う効果より静かに見せられる'],'説明文、画像、補足情報','重要な情報の表示を長く遅らせない。読み込みの完了を隠す目的で使わない。',800),
entry('mo-slide','Slide In','スライド',['登場'],['移動','横','transform'], '横から滑り込み、要素が入ってくる方向を示す。',['横方向へ移動して定位置に収まる','終わりに向かってゆっくり減速する','透明度を変えず、移動の違いを見せる'],'パネル、通知、画面内の補助要素','移動距離を長くしすぎない。方向に意味を持たせ、一貫させる。',800),
entry('mo-scale','Scale In','ズーム',['登場'],['拡大','scale','スケール'], '小さな状態から広がり、手前に現れる印象を作る。',['中心を基準に大きさを変える','定位置を保ったまま拡大する','実寸まで拡大し、その状態で止める'],'ダイアログ、選択アイテム、画像','大きな拡大を繰り返さない。文字を拡大したまま止めず、読みやすい実寸へ戻す。',800),
entry('mo-bounce','Bounce','バウンス',['登場','強調'],['弾む','跳ねる','オーバーシュート'], '落下と跳ね返りを繰り返し、弾力や重さを見せる。',['落下は加速し、跳ね上がるときは減速する','同じ着地点で跳ね返り、高さをだんだん小さくする','着地の小さな潰れと影で接地感を出す'],'達成表示、カジュアルなボタン、マスコット','常時揺らさず、達成や選択など意味のある瞬間に使う。',1100),
entry('mo-rotate','Rotate','回転',['強調'],['rotate','スピン','回る'], 'その場で一周し、変化や切り替わりを印象づける。',['中心を軸に一周する','回り始めと終わりをゆっくりにする','一周ごとに短い間を置いて繰り返す'],'更新アイコン、切り替え、短い演出','文章全体を回さず、小さな記号や図形に使う。処理中の表示なら完了時に止める。',1200),
entry('mo-flip','Flip','フリップ',['登場'],['3D','裏返る','立体','rotateY'], '表から裏へ回転し、厚みや奥行きを見せる。',['縦軸を中心に表・裏・表へ回転する','側面の厚みと遠近感で立体を見せる','表面と裏面を別々に描き、文字の反転を防ぐ'],'カード、答え合わせ、情報の開示','回転中は文章を読ませない。大きな面を何度も反転させない。',1000),
entry('mo-stagger','Stagger','順番に表示',['登場'],['時間差','順次','リスト','スタガー'], '少しずつ時間をずらし、複数の要素へ視線を導く。',['同じ動きを少しずつ遅らせて再生する','左から右へ順に現れる','要素数が増えても全体を長く待たせない'],'カード一覧、メニュー、短い項目リスト','後ろの項目が遅れすぎないように、全体の所要時間に上限を設ける。',1100),
entry('mo-pulse','Pulse','パルス',['強調'],['脈動','拡縮','呼吸'], '緩やかに膨らんで戻り、注目してほしい箇所を示す。',['緩やかに大きさを増減する','輪郭や文字の形は変えない','小さな変化で呼吸のようなリズムを作る'],'新しい機能、注目点、短い状態通知','繰り返し続けると注意を奪うため、回数と強さを抑える。',1200),
entry('mo-shake','Shake','シェイク',['反応','強調'],['エラー','揺れる','左右'], '短く左右に揺らし、入力の見直しなどを促す。',['左右の移動を短時間で繰り返す','振れ幅を減らして元の位置へ戻す','揺れ以外の説明も合わせて表示する'],'入力エラー、選択できない操作','動きだけで理由を伝えない。実際のUIではエラーメッセージを添える。',600),
entry('mo-ripple','Ripple','リップル',['反応'],['波紋','クリック','タップ'], '押した場所から波紋を広げ、入力への反応を返す。',['クリックやタップ位置から円が広がる','円は大きくなりながら薄く消える','自動再生では中央から広がる'],'ボタン、タッチ操作、選択できる面','波紋を要素の外へはみ出させず、ラベルの読みやすさを保つ。',850)
];
function chocolate(){
 const pieces=Array.from({length:9},(_,i)=>{
  const x=12+(i%3)*26,y=8+Math.floor(i/3)*23;
  return `<path d="M${x} ${y}H${x+25}V${y+22}H${x}Z" fill="#a16a49"/><path d="M${x} ${y}H${x+25}L${x+22} ${y+3}H${x+3}V${y+19}L${x} ${y+22}Z" fill="#b78159"/><path d="M${x} ${y+22}L${x+3} ${y+19}H${x+22}V${y+3}L${x+25} ${y}V${y+22}Z" fill="#895237"/>`;
 }).join('');
 return `<span class="motion-object"><svg class="chocolate-bar" viewBox="0 0 100 142" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
 <rect x="8" y="4" width="84" height="129" rx="5" fill="#754a35"/>
 ${pieces}
 <path d="M6 73Q6 69 11 70L90 74Q95 74 95 79V129Q95 137 87 137H13Q5 137 5 129Z" fill="#c4ced2"/>
 <path d="M5 87H95V130Q95 138 87 138H13Q5 138 5 130Z" fill="#df4447"/>
 <path d="M10 130Q10 133 15 133H85" fill="none" stroke="#bf3338" stroke-width="2.5" stroke-linecap="round"/>
 <path d="M6 73Q7 70 11 72L32 77 50 73 70 80 91 75Q95 74 95 78L91 94Q90 97 86 96L68 93 49 98 30 91 12 94Q7 94 7 90Z" fill="#e9eff0" stroke="#c4ced2" stroke-width="1.5" stroke-linejoin="round"/>
 <path d="M12 78L30 83 49 79M73 86L88 82" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
 </svg></span>`;
}
function solidChocolate(){
 const front=chocolate().replace('<span class="motion-object">','').replace('</svg></span>','</svg>');
 return `<span class="motion-object chocolate-solid"><span class="chocolate-body"><span class="chocolate-front">${front}</span><svg class="chocolate-back" viewBox="0 0 100 142" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
 <rect x="8" y="4" width="84" height="129" rx="5" fill="#895438"/>
 <path d="M14 11H86V71H14Z" fill="none" stroke="#754a35" stroke-width="2"/>
 <path d="M5 76H95V130Q95 138 87 138H13Q5 138 5 130Z" fill="#df4447"/>
 <path d="M5 76L28 81 48 77 71 83 95 77V91L71 96 48 90 28 94 5 89Z" fill="#d5dfe2"/>
 <path d="M52 95V135M12 131H88" fill="none" stroke="#bf3338" stroke-width="2"/>
 </svg><i class="chocolate-side side-left"></i><i class="chocolate-side side-right"></i><i class="chocolate-edge edge-top"></i><i class="chocolate-edge edge-bottom"></i></span></span>`;
}
export function motionMarkup(m: CatalogItem,detail=false){
 const ring=m.id==='mo-gauge'?`<svg class="motion-gauge" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle class="gauge-track" cx="50" cy="50" r="44"/><circle class="gauge-progress" cx="50" cy="50" r="44" pathLength="1"/></svg>`:'';
 const art=m.id==='mo-stagger'?`<span class="motion-stack">${Array.from({length:3},chocolate).join('')}</span>`:m.id==='mo-flip'?solidChocolate():chocolate();
 const stage=detail?`<div class="motion-stage" role="img" aria-label="${m.ja}の見本">`:`<button class="motion-stage" type="button" data-detail="${m.id}" aria-label="${m.ja}の見本と特徴を見る">`;
 return `<div class="motion-demo ${m.id}" data-motion="${m.id}">${stage}<span class="motion-art" aria-hidden="true">${ring}${art}</span>${detail?'</div>':'</button>'}</div>`;
}
export function motionPrompt(m: MotionStyle){return `「${m.ja}（${m.name}）」をUIに適用してください。\n\n動き：${m.description}\n特徴：${m.traits.join('。')}。\n用途：${m.use}\n注意：${m.avoid}\n\nCSSのtransitionまたはanimationと@keyframesを使い、ホバー、クリック、選択、画面への登場など、適用するきっかけに合わせて再生してください。動きによってレイアウトを押し動かさず、キーボードとタッチでも操作できるようにします。prefers-reduced-motionでは動きを省き、情報や操作を失わないようにしてください。`;}
// Pause the timeline without resetting it. Preview activation opens details.
export function mountMotions(root: HTMLElement){
 const media=window.matchMedia('(prefers-reduced-motion: reduce)');
 const disposers=[...root.querySelectorAll('[data-motion]')].map(demo=>{
  let visible=!('IntersectionObserver' in window);
  const sync=()=>demo.classList.toggle('is-paused',!visible||document.hidden||media.matches);
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}):null;
  media.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  sync();observer?.observe(demo);
  return()=>{demo.classList.add('is-paused');observer?.disconnect();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync)};
 });
 return()=>disposers.forEach(dispose=>dispose());
}
