import type {ExampleItem, CatalogItem} from '../types';
export const transitionFilters=['すべて','切り替え','フェード','ワイプ','移動','変形'];
const entry=(id: string,name: string,ja: string,category: string,tags: string[],description: string,traits: string[],use: string,avoid: string): ExampleItem=>({id,name,ja,category:[category],tags,description,traits,use,avoid});
export const transitions=[
 entry('tr-cut','Cut','カット','切り替え',['直接','編集','瞬間'],'前の映像から次の映像へ、瞬時に切り替える。',['2つの映像を重ねずに切り替える','動きや音の区切りに合わせやすい','切り替え自体に時間を使わない'],'会話、テンポのよい編集、通常の場面転換','短い間隔で繰り返さず、視線や動作のつながりを確認する。'),
 entry('tr-dissolve','Cross Dissolve','ディゾルブ','フェード',['クロス','重なる','透明度'],'2つの映像を重ねながら、滑らかに入れ替える。',['前の映像が薄れ、次の映像が現れる','輪郭が一時的に重なる','時間や場所の移り変わりを柔らかく見せる'],'風景、回想、穏やかな場面転換','重なった被写体が見づらくならない長さにする。'),
 entry('tr-black','Dip to Black','暗転','フェード',['黒','フェードアウト'],'一度黒くしてから、次の映像を映し出す。',['黒い画面を間に挟む','前後の場面に明確な区切りを作る','終わりや時間の経過を表しやすい'],'章の区切り、時間経過、エンディング','黒い時間が長すぎると、再生終了や読み込みに見える。'),
 entry('tr-white','Dip to White','白転','フェード',['白','光','フェードアウト'],'一度白くしてから、次の映像を映し出す。',['白い画面を間に挟む','光に包まれるような切り替えになる','暗転より明るい余韻を作る'],'光の演出、回想、明るい場面転換','急な白の点滅を避け、明るさを滑らかに変える。'),
 entry('tr-wipe','Horizontal Wipe','横ワイプ','ワイプ',['左右','マスク','境界'],'境界線が横へ進み、次の映像を見せる。',['映像の位置は固定したまま切り替える','左から右へ見える範囲を広げる','切り替える方向がはっきり伝わる'],'前後比較、場所の移動、説明動画','境界の向きを前後の場面と合わせる。'),
 entry('tr-wipe-up','Vertical Wipe','縦ワイプ','ワイプ',['上下','マスク','境界'],'境界線が下から上へ進み、映像を入れ替える。',['映像自体を移動させずに切り替える','下から上へ次の映像を露出する','縦方向の動きにつなげやすい'],'縦型動画、上下の移動、段階の切り替え','被写体の動きと逆向きにするときは、意図を持たせる。'),
 entry('tr-iris','Iris','アイリス','ワイプ',['円形','丸','開く'],'円が広がり、その内側に次の映像が現れる。',['円形のマスクを広げる','中心に視線を集める','位置を変えると注目する対象を選べる'],'被写体の紹介、ポップな映像、場面の開幕','円の中心を主役に合わせ、重要な部分を隠さない。'),
 entry('tr-blinds','Venetian Blinds','ブラインド','ワイプ',['帯','分割','スリット'],'複数の帯が同時に開き、次の映像を見せる。',['画面を横長の帯に分ける','帯ごとに見える範囲を広げる','規則的なリズムを作る'],'グラフィック動画、タイトル、レトロな演出','細かく分割しすぎるとちらつきやすい。'),
 entry('tr-slide','Slide Over','スライド','移動',['覆う','横移動'],'次の映像が滑り込み、前の映像を覆う。',['前の映像はその場に残る','次の映像だけが横から入る','画面が重なる関係を見せる'],'パネル切り替え、解説、場面の導入','ワイプと違い、映像全体が移動する。文字を読ませる時間を別に確保する。'),
 entry('tr-push','Push','プッシュ','移動',['押し出す','連動','横移動'],'次の映像が、前の映像を押し出して入る。',['前後の映像が同じ方向へ移動する','境界で2つの画面がつながる','続きの場面へ進む感覚を作る'],'スライドショー、手順、連続する場所の移動','方向と速度をそろえ、途中に隙間を作らない。'),
 entry('tr-zoom','Zoom Reveal','ズーム','変形',['拡大','スケール'],'次の映像を中心から拡大して、画面を満たす。',['次の映像全体の大きさを変える','中央から手前へ来る印象を作る','拡大後は実寸で止まる'],'主役の紹介、テンポのある編集、話題の切り替え','拡大率を上げすぎず、低解像度の素材に注意する。'),
 entry('tr-blur','Blur Dissolve','ぼかし','変形',['ブラー','ピント','重なる'],'ぼけた次の映像が重なり、徐々に鮮明になる。',['輪郭をぼかしながら重ねる','最後にピントが合うように見せる','細部の切り替わりを柔らかくする'],'回想、雰囲気の切り替え、写真の連続表示','ぼかしを長く残さず、見せたい場面では鮮明に戻す。')
];

// Every effect uses the same two silent scenes, so only the transition changes.
function scene(night=false){
 return night?`<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="250" fill="#243b59"/><circle cx="294" cy="61" r="25" fill="#f6e8bb"/><circle cx="305" cy="51" r="23" fill="#243b59"/><g fill="#b4cccf"><circle cx="72" cy="40" r="2"/><circle cx="183" cy="30" r="1.7"/><circle cx="340" cy="107" r="2"/><circle cx="131" cy="79" r="1.6"/></g><path d="M0 185 97 66 194 185 260 113 400 209V250H0Z" fill="#587a8e"/><path d="m97 66-30 37 31-8 22 9Z" fill="#e0e5db"/><path d="M0 191Q67 156 141 192T279 188T400 175V250H0Z" fill="#284f60"/><path d="M0 221Q90 205 191 222T400 211V250H0Z" fill="#46737b"/><path d="M258 205h37m-55 15h64m-47 14h39" stroke="#a2bfc0" stroke-width="2" stroke-linecap="round"/></svg>`:`<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="250" fill="#f1d5aa"/><circle cx="112" cy="74" r="32" fill="#d98653"/><path d="M0 150Q70 115 145 155T287 144T400 155V250H0Z" fill="#b77862"/><path d="M0 182Q88 146 168 178T315 174T400 185V250H0Z" fill="#d6a181"/><path d="M0 211Q80 188 174 212T400 203V250H0Z" fill="#718b85"/><path d="M280 208h48m-58 14h74m-42 13h30" stroke="#d8dcc3" stroke-width="2" stroke-linecap="round"/><path d="M291 81q7-8 14 0m8-11q7-8 14 0" fill="none" stroke="#9f715c" stroke-width="2" stroke-linecap="round"/></svg>`;
}
export function transitionMarkup(t: CatalogItem,detail=false){
 const start=detail?`<div class="motion-stage transition-stage" role="img" aria-label="${t.ja}の見本">`:`<button class="motion-stage transition-stage" type="button" data-detail="${t.id}" aria-label="${t.ja}の見本と特徴を見る">`;
 return `<div class="transition-demo ${t.id}" data-motion="${t.id}">${start}<span class="transition-art" aria-hidden="true"><span class="tr-scene tr-base">${scene()}</span><span class="tr-scene tr-next">${scene(true)}</span><span class="tr-scene tr-return">${scene()}</span><span class="tr-curtain"></span></span>${detail?'</div>':'</button>'}</div>`;
}
export function transitionPrompt(t: ExampleItem){return `「${t.ja}（${t.name}）」で2つの映像・画面を切り替えてください。\n\n動き：${t.description}\n特徴：${t.traits.join('。')}。\n用途：${t.use}\n注意：${t.avoid}\n\n前後の映像を十分に見せ、切り替えは短く明確にしてください。WebではCSSのtransform、opacity、clip-pathなどを効果に応じて使い、動画編集では同等のトランジションやマスクで再現してください。見本用の繰り返しと実際の切り替えを分け、Webのprefers-reduced-motionでは動きを省いてください。`;}
