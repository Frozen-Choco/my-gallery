export const modelRepository='https://github.com/Frozen-Choco/low-poly-models';
const source='https://raw.githubusercontent.com/Frozen-Choco/low-poly-models/main/';
const categoryNames={furniture:'家具',household:'生活小物',street:'街の設備'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=n=>Number.isFinite(n)&&n>=0?n:null;
const count=n=>n===null?'—':n.toLocaleString('ja-JP');
const size=n=>n===null?'':n>=1000000?`${(n/1000000).toFixed(1)} MB`:`${(n/1000).toFixed(1)} KB`;

export function normalizeModels(data){
 if(!Array.isArray(data))throw new Error('Invalid catalog');
 const seen=new Set();
 const items=data.flatMap(m=>{
  if(!m||!['id','category'].every(k=>typeof m[k]==='string'&&/^[a-z0-9_-]{1,100}$/i.test(m[k]))||seen.has(m.id))return [];
  seen.add(m.id);
  const category=categoryNames[m.category]||m.category;
  const base=`${source}assets/${m.category}/${m.id}/`;
  return [{id:m.id,name:m.id,ja:typeof m.title_ja==='string'?m.title_ja:m.id,category:[category],tags:[m.category,'ローポリ','GLB','Blender'],description:'',use:'',triangles:number(m.triangles),vertices:number(m.vertices),dimensions:Array.isArray(m.dimensions_m)&&m.dimensions_m.length===3&&m.dimensions_m.every(n=>number(n)!==null)?m.dimensions_m:null,glbBytes:number(m.glb_bytes),blendBytes:number(m.blend_bytes),blender:typeof m.blender_version==='string'?m.blender_version:'',preview:base+'preview.jpg',back:base+'back.jpg',glb:base+m.id+'.glb',blend:base+m.id+'.blend'}];
 });
 if(data.length&&!items.length)throw new Error('No valid models');
 return {items,filters:['すべて',...new Set(items.flatMap(m=>m.category))]};
}
async function readCatalog(fetcher,url){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),8000);
 try{const response=await fetcher(url,{signal:controller.signal,cache:'no-cache'});if(!response.ok)throw new Error('Catalog unavailable');return normalizeModels(await response.json());}finally{clearTimeout(timer);}
}
export async function loadModelCatalog(fetcher=fetch){
 try{return {...await readCatalog(fetcher,source+'catalog.json'),fallback:false};}
 catch{return {...await readCatalog(fetcher,new URL('./models-catalog.json',import.meta.url)),fallback:true};}
}
function preview(m,back=false){return `<span class="model-image-frame"><img class="model-image" src="${back?m.back:m.preview}" alt="${esc(m.ja)}の${back?'背面':'正面'}" loading="lazy" decoding="async"><span class="model-image-error">画像を読み込めません</span></span>`;}
function downloads(m){return `<div class="model-downloads"><a href="${m.glb}" download="${m.id}.glb" aria-label="${esc(m.ja)}のGLBをダウンロード">GLB <span>↓ ${size(m.glbBytes)}</span></a><a href="${m.blend}" download="${m.id}.blend" aria-label="${esc(m.ja)}のBlenderファイルをダウンロード">Blend <span>↓ ${size(m.blendBytes)}</span></a></div>`;}
export function modelCard(m){return `<article class="style-card model-card" data-id="${m.id}"><button class="preview-button model-preview" data-detail="${m.id}" aria-label="${esc(m.ja)}の詳細を見る">${preview(m)}</button><div class="card-info"><button class="card-title" data-detail="${m.id}"><h2>${esc(m.ja)}</h2></button><p class="model-meta">${esc(m.category[0])}<span>${count(m.triangles)} tris</span></p>${downloads(m)}</div></article>`;}
export function modelDetail(m){
 const dimensions=m.dimensions?.map(n=>Number(n.toFixed(3)).toLocaleString('ja-JP')).join(' × ');
 return `<div class="detail-layout model-detail"><div class="detail-visual"><div class="model-preview model-stage" data-model-stage><div class="model-photo hidden">${preview(m)}</div><div class="model-viewer-host"></div><div class="model-viewer-status" role="status"></div><button class="model-camera-reset hidden" aria-label="視点をリセット" title="視点をリセット">↺</button></div><div class="model-angles" aria-label="表示方法"><button class="active" data-model-view="3d" aria-pressed="true">3D</button><button data-model-view="front" aria-pressed="false">正面</button><button data-model-view="back" aria-pressed="false">背面</button></div><p class="model-gesture-hint">ドラッグで回転 · スクロール／ピンチで拡大</p></div><div class="detail-notes"><p class="model-category">${esc(m.category[0])}</p><dl class="model-specs"><div><dt>三角形</dt><dd>${count(m.triangles)}</dd></div><div><dt>頂点</dt><dd>${count(m.vertices)}</dd></div>${dimensions?`<div><dt>寸法（m）</dt><dd>${dimensions}<small>X × Y × Z ／ Blender座標</small></dd></div>`:''}${m.blender?`<div><dt>制作環境</dt><dd>Blender ${esc(m.blender)}</dd></div>`:''}</dl>${downloads(m)}<p class="model-file-note">GLB：利用用 ／ Blend：編集用</p><p class="model-license"><a href="${modelRepository}#ライセンス" target="_blank" rel="noopener noreferrer">利用条件・配布元</a></p></div></div>`;
}
export function setModelAngle(root,m,back){
 const frame=root.querySelector('.model-image-frame'),img=frame.querySelector('img');
 frame.classList.remove('image-failed');img.src=back?m.back:m.preview;img.alt=`${m.ja}の${back?'背面':'正面'}`;
}
