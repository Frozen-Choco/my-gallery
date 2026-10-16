import type {GameStyle, CatalogItem} from '../types';
export const gameFilters=['すべて','レトロ','ファンタジー','SF','ポップ','ミニマル'];
const entry=(id: string,name: string,ja: string,category: string[],tags: string[],description: string,traits: string[],use: string,avoid: string,colors: string[])=>({id,name,ja,category,tags,description,traits,use,avoid,colors});
export const games=[
entry('gs-classic','Classic Monochrome RPG','黒地・白枠RPG',['レトロ','ミニマル'],['ドラクエ','ドラゴンクエスト','モノクロ','等幅','黒い画面'], 'ドラクエ風の黒地・白枠。文字とカーソルだけで伝える。',['黒い面に白い細枠を置き、余白を一定にする','等幅文字と三角カーソルで選択状態を示す','影やグラデーションを使わず、明暗をはっきり分ける'],'クラシックRPG、ドット絵、短いコマンド中心のゲーム','小さい文字に頼らず、字間と行間を確保する。白枠を増やしすぎない。',['#050505','#ffffff']),
entry('gs-blue','Blue Window RPG','青いグラデーションRPG',['レトロ'],['青','銀枠','ウィンドウ','JRPG'], '青の濃淡と銀色の枠で、懐かしいRPGの窓を作る。',['濃い青から明るい青へ変わる面を使う','銀色の二重枠でウィンドウの輪郭を強調','白文字に薄い影を付け、複数の窓を重ねる'],'レトロJRPG、パーティー制RPG、ドット絵の冒険','光沢や縁を強くしすぎない。重なる窓の前後関係を明確にする。',['#071665','#254cc5','#e1e9ff']),
entry('gs-handheld','Handheld Monochrome','携帯機モノクロ',['レトロ'],['ゲームボーイ風','緑','ドット','液晶'], '少ない緑の階調と角ばった図形で、携帯ゲーム機らしく。',['明るい黄緑から暗緑まで少数の階調に絞る','文字・図形・枠をドットの粒度に合わせる','角ばった選択枠と単純な記号を使う'],'小さな画面のゲーム、レトロパズル、ドット絵作品','見た目を優先してコントラストを下げない。細かい液晶模様は控えめにする。',['#c2cf8a','#829651','#354c30']),
entry('gs-parchment','Parchment Fantasy','羊皮紙・古地図',['ファンタジー'],['紙','手書き','セリフ','古書'], '紙の色、インクの線、セリフ体で、古書のように見せる。',['生成りの紙に茶色のインクを重ねる','罫線・飾り罫・端のゆがみで紙らしさを出す','文字はセリフ体で、読みやすい余白を取る'],'冒険、物語、歴史、穏やかなファンタジー','紙の汚れや模様を本文に重ねすぎない。操作箇所は装飾から区別する。',['#ead9b0','#705033','#b69358']),
entry('gs-forged','Forged Fantasy','石と金属の装飾',['ファンタジー'],['重厚','石','金属','革','宝石'], '厚い縁、金属の留め具、宝石で、道具のような存在感を。',['石や革の暗い面を、厚い金属枠で囲む','留め具と角の装飾で物質感を作る','宝石や光で選択中の項目を強調'],'重厚なRPG、戦略ゲーム、剣と魔法の世界','装飾で表示領域を狭めすぎない。小さな画面では枠の厚さを減らす。',['#292b2a','#9b8053','#63a8a0']),
entry('gs-gothic','Dark Fantasy','ダークファンタジー',['ファンタジー'],['ゴシック','暗い','金','セリフ','退廃'], '暗い半透明の面と鈍い金色で、静かな緊張感を作る。',['黒に近い背景と、彩度を抑えた金色を使う','細い飾り罫とセリフ体で古びた品格を出す','選択中の行だけを淡く照らす'],'ダークファンタジー、探索、シリアスなアクションRPG','暗い配色でも文字は十分に明るくする。装飾を本文と競合させない。',['#191a19','#b39c70','#e2d7c1']),
entry('gs-holo','Holographic Sci-Fi','SFホログラム',['SF'],['シアン','透明','発光','機械'], '透明な面、細い発光線、欠けた角で、空中の操作盤に。',['青緑の発光線と透明なパネルを重ねる','切り欠きや角のマーカーで技術的な印象を作る','補助グリッドは薄く、重要な文字は明るくする'],'宇宙、ロボット、近未来のアクションゲーム','発光は枠のアクセントに絞り、文字の輪郭をぼかさない。',['#0c202b','#6ce0dc','#d7ffff']),
entry('gs-crt','CRT Terminal','CRTターミナル',['SF','レトロ'],['緑文字','ブラウン管','端末','レトロフューチャー'], '暗い画面に緑の等幅文字。古い端末の発光を取り入れる。',['ほぼ黒の背景に、単色の発光文字を置く','罫線・カーソル・反転表示で階層を示す','走査線は弱く重ねてブラウン管を連想させる'],'レトロSF、ハッキング、機械を操作するゲーム','点滅やノイズは必須にしない。長い文章は発光を弱めて読む負担を減らす。',['#09160e','#a2d77c','#466b3e']),
entry('gs-graphic','Graphic Red & Black','赤・黒グラフィック',['ポップ'],['赤黒','斜め','大胆','切り紙','コミック'], '赤・黒・白の強い対比と、斜めの面で勢いを出す。',['斜めに切った帯と非対称な配置を使う','太い文字を大きく置き、白黒を反転させる','選択中の項目を面の形や角度でも区別する'],'スタイリッシュなRPG、リズム、コミック調の作品','すべてを傾けず、長い説明文は水平にする。選択の順序を迷わせない。',['#d82b37','#101014','#ffffff']),
entry('gs-arcade','Neon Arcade','ネオンアーケード',['レトロ','ポップ','SF'],['ネオン','ピンク','紫','ゲームセンター'], 'ピンクとシアンの発光、奥行きのある格子で華やかに。',['暗い紫を背景に、鮮やかな補色を置く','ネオンの縁取りと大きな欧文で視線を集める','光る線と遠近のある格子で奥行きを出す'],'アーケード、レース、リズム、スコアを競うゲーム','色を増やしすぎず、発光の中でもラベルを読めるようにする。',['#191333','#ff75c4','#7af1f0']),
entry('gs-cozy','Soft & Cozy','丸く柔らかい',['ポップ'],['かわいい','パステル','丸い','ナチュラル'], 'クリーム色、丸い面、柔らかな影で、親しみやすく。',['角丸の大きなパネルとゆったりした間隔を使う','淡い背景に濃い文字を置く','小さな葉や点のモチーフで遊び心を加える'],'生活シミュレーション、農園、カジュアルゲーム','淡い色同士で文字を埋もれさせない。押せる面と背景の装飾を区別する。',['#e3eddb','#fff8e7','#477568']),
entry('gs-minimal','Minimal Monotone','ミニマル・モノトーン',['ミニマル'],['生成り','余白','罫線','無機質'], '生成りと墨色、細い罫線、広い余白で静かに整える。',['少数の色と細い線で情報を区切る','見出し・補助文字の大きさと字間で階層を作る','選択中の行だけを濃い面で反転させる'],'静かなSF、探索、物語、洗練されたパズル','控えめな見た目でも選択状態は明確にする。小さな薄い文字に頼らない。',['#dad6c5','#383b34','#a29f8e'])
];
const ja='<span lang="ja">サンプル</span>';
const en='<span lang="en">Sample</span>';
const heading=`<div class="gs-heading">${ja}${en}</div>`;
const rows=`<div class="gs-rows"><div class="gs-selected">${ja}</div><div>${en}</div></div>`;
const ornament='<div class="gs-ornament"><i></i><i></i><i></i></div>';
const corners='<i class="gs-corner tl"></i><i class="gs-corner tr"></i><i class="gs-corner bl"></i><i class="gs-corner br"></i>';
export function gameMarkup(s: CatalogItem){const compositions: Record<string,()=>string>={
'gs-classic':()=>`<div class="classic-small"></div><div class="classic-window">${rows}</div>`,
'gs-blue':()=>`<div class="blue-back">${ornament}</div><div class="blue-window">${rows}</div>`,
'gs-handheld':()=>`<div class="handheld-screen"><div class="pixel-flower"><i></i></div>${rows}<div class="handheld-track"><i></i><i></i><i></i></div></div>`,
'gs-parchment':()=>`<div class="paper-sheet">${heading}<div class="paper-rule"></div><div class="paper-compass">✧</div></div>`,
'gs-forged':()=>`<div class="forged-panel">${corners}<div class="forged-gem"></div>${rows}</div>`,
'gs-gothic':()=>`<div class="gothic-arch"></div><div class="gothic-window"><div class="gothic-rule"></div>${rows}<div class="gothic-rule"></div></div>`,
'gs-holo':()=>`<div class="holo-orbit"><i></i></div><div class="holo-panel">${heading}${ornament}</div><div class="holo-scale"></div>`,
'gs-crt':()=>`<div class="crt-window">${rows}<div class="crt-divider"></div><div class="crt-blocks"><i></i><i></i><i></i><i></i><i></i></div></div>`,
'gs-graphic':()=>`<div class="graphic-burst"></div><div class="graphic-title">${ja}</div><div class="graphic-choice">${en}</div><div class="graphic-star">✦</div>`,
'gs-arcade':()=>`<div class="arcade-grid"></div><div class="arcade-orbit"></div><div class="arcade-panel">${heading}</div>`,
'gs-cozy':()=>`<div class="cozy-leaf"></div><div class="cozy-panel">${heading}${ornament}</div><div class="cozy-dot"></div>`,
'gs-minimal':()=>`<div class="minimal-rail"></div><div class="minimal-panel">${rows}<div class="minimal-lines"><i></i><i></i><i></i></div></div>`
};return compositions[s.id]();}
export function gamePrompt(s: GameStyle){return `「${s.ja}（${s.name}）」の見た目を基調にゲームUIを制作してください。\n\n表現：${s.description}\n特徴：${s.traits.join('。')}。\n配色の目安：${s.colors.join(' / ')}。\n注意：${s.avoid}\n\nこの様式を、制作するゲームの画面構成や情報量に合わせて適用してください。見本の文言は実際の内容に置き換え、文字サイズとコントラスト、選択中・使用不可の区別を確保してください。`;}
