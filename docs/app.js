import {styles,filters,promptFor} from './data.js';
import {sampleMarkup} from './samples.js';
import {games,gameFilters,gameMarkup,gamePrompt} from './games.js';
import {motions,motionFilters,motionMarkup,motionPrompt,mountMotions} from './motion.js';
import {transitions,transitionFilters,transitionMarkup,transitionPrompt} from './transitions.js';
import {loadModelCatalog,modelCard,modelDetail,setModelAngle} from './models.js';
let modelsState='idle',modelsPending=null;
const animatedPage=()=>page==='motion'||page==='transitions';
const catalogs={styles:{title:'デザインスタイル',items:styles,filters,markup:sampleMarkup,prompt:promptFor},games:{title:'ゲームUI',items:games,filters:gameFilters,markup:gameMarkup,prompt:gamePrompt},motion:{title:'モーション',items:motions,filters:motionFilters,prompt:motionPrompt},transitions:{title:'トランジション',items:transitions,filters:transitionFilters,prompt:transitionPrompt},models:{title:'3Dモデル',items:[],filters:['すべて']}};
const paths={cube:'<path d="m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8M7.5 5.5l9 5"/>',game:'<path d="M7 7h10c3 0 5 10 3 11-2 1-4-3-4-3H8s-2 4-4 3C2 17 4 7 7 7Z"/><path d="M8 9v5M5.5 11.5h5M15 10h.01M18 13h.01"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',motion:'<path d="m10 6 9 6-9 6zM4 7v10"/>',layers:'<path d="m12 3 10 6-10 6L2 9zM3 13l9 5 9-5M3 17l9 5 9-5"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',list:'<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'};
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.grid}</svg>`;
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hydrate=()=>$$('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);el.removeAttribute('data-icon')});
const pageFromHash=()=>Object.hasOwn(catalogs,location.hash.slice(1))?location.hash.slice(1):'styles';
let page=pageFromHash();
let disposeGalleryMotions=()=>{},disposeDetailMotions=()=>{};
let filter='すべて',query='',sort='default',view='grid',lastFocus=null,toastTimer;
const specimen=(s,detail=false)=>page==='transitions'?transitionMarkup(s,detail):page==='motion'?motionMarkup(s,detail):`<div class="sample ${page==='games'?'game-sample':''} ${s.id}" aria-hidden="true">${catalogs[page].markup(s)}</div>`;
async function ensureModels(retry=false){
 if(modelsPending||(!retry&&modelsState==='loaded'))return;
 modelsState='loading';if(page==='models')render();
 modelsPending=loadModelCatalog();
 try{const result=await modelsPending;catalogs.models.items=result.items;catalogs.models.filters=result.filters;modelsState=result.fallback?'fallback':'loaded';}
 catch{modelsState='error';}
 finally{modelsPending=null;if(page==='models')render();}
}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function render(){
  disposeGalleryMotions();
  const catalog=catalogs[page];
  const matched=catalog.items.filter(s=>(filter==='すべて'||s.category.includes(filter))&&`${s.name} ${s.ja} ${s.tags.join(' ')} ${s.category.join(' ')} ${s.description} ${s.use}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  if(sort==='name')matched.sort((a,b)=>a.ja.localeCompare(b.ja,'ja'));
  $('#gallery').innerHTML=matched.map(s=>page==='models'?modelCard(s):`<article class="style-card ${animatedPage()?'motion-card':''}" data-id="${s.id}">${animatedPage()?specimen(s):`<button class="preview-button" data-detail="${s.id}" aria-label="${s.name} の見本と特徴を見る">${specimen(s)}</button>`}<div class="card-info"><button class="card-title" data-detail="${s.id}"><h2>${s.ja}</h2></button><p class="card-description">${s.description}</p></div></article>`).join('');
  disposeGalleryMotions=mountMotions($('#gallery'));
  $('#gallery').classList.toggle('list-view',view==='list');
  $('#result-count').textContent=`${matched.length}件`;
  $('#empty').classList.toggle('hidden',matched.length>0||(page==='models'&&['idle','loading','error'].includes(modelsState)));
  const modelStatus=page==='models'?modelsState:'';
  $('#catalog-status').classList.toggle('hidden',!['loading','fallback','error'].includes(modelStatus));
  $('#catalog-status').innerHTML=modelStatus==='loading'?'モデルを読み込んでいます…':modelStatus==='fallback'?'最新の一覧を取得できないため、保存済みの一覧を表示しています。<button data-model-retry>再読み込み</button>':modelStatus==='error'?'モデルを読み込めませんでした。<button data-model-retry>再読み込み</button>':'';
  $('#empty-message').textContent='該当する見本がありません。';
  $('#filter-reset').classList.toggle('hidden',!query&&filter==='すべて');
  $('#filters').innerHTML=catalog.filters.map(f=>`<button class="filter-chip ${f===filter?'active':''}" data-filter="${esc(f)}" aria-pressed="${f===filter}">${f}</button>`).join('');
}
function showDialog(dialog){lastFocus=document.activeElement;dialog.showModal();document.body.classList.add('modal-open');dialog.scrollTop=0;$('.close-dialog',dialog)?.focus()}
function closeDialog(dialog){disposeDetailMotions();dialog.close();disposeGalleryMotions=mountMotions($('#gallery'));document.body.classList.remove('modal-open');if(lastFocus?.isConnected)lastFocus.focus()}
function openDetail(id){disposeGalleryMotions();disposeDetailMotions();const s=catalogs[page].items.find(s=>s.id===id);if(!s)return;if(page==='models'){const dialog=$('#detail-dialog');dialog.dataset.modelId=s.id;$('#detail-content').innerHTML=`<div class="dialog-top"><h2>${esc(s.ja)}</h2><button class="icon-button close-dialog" aria-label="閉じる">${icon('close')}</button></div>${modelDetail(s)}`;showDialog(dialog);return;}$('#detail-content').innerHTML=`<div class="dialog-top"><h2>${s.ja}</h2><button class="icon-button close-dialog" aria-label="閉じる">${icon('close')}</button></div><div class="detail-layout"><div class="detail-visual">${specimen(s,true)}</div><div class="detail-notes"><div class="detail-block"><h3>特徴</h3><ul class="trait-list">${s.traits.map(t=>`<li>${t}</li>`).join('')}</ul></div><div class="detail-block"><h3>用途</h3><p>${s.use}</p></div><div class="detail-block"><h3>注意点</h3><p>${s.avoid}</p></div></div></div><details class="prompt-section"><summary>AIへの指示例</summary><label for="prompt-text" class="sr-only">編集できるAIへの指示例</label><textarea id="prompt-text" spellcheck="false">${esc(catalogs[page].prompt(s))}</textarea><button class="primary-button" id="copy-prompt">${icon('copy')} コピー</button></details>`;showDialog($('#detail-dialog'));disposeDetailMotions=mountMotions($('#detail-content'))}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('指示例をコピーしました')}catch{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';const host=$('dialog[open]')||document.body;host.append(area);area.focus();area.select();const success=document.execCommand('copy');area.remove();toast(success?'指示例をコピーしました':'コピーできませんでした。指示例を選択してコピーしてください。')}}
function switchCatalog(next){
 page=Object.hasOwn(catalogs,next)?next:'styles';
 history.replaceState(null,'',page==='styles'?location.pathname:'#'+page);
 $('#catalog-title').textContent=catalogs[page].title;
 $('#search').placeholder=page==='models'?'モデル名・カテゴリで検索':animatedPage()?'効果・特徴で検索':'スタイル・特徴で検索';
 $('#search').setAttribute('aria-label',catalogs[page].title+'・キーワードを検索');
 $('#filters').setAttribute('aria-label',page==='models'?'カテゴリで絞り込む':animatedPage()?'効果で絞り込む':page==='games'?'見た目で絞り込む':'印象で絞り込む');
 $$('[data-page]').forEach(b=>{b.classList.toggle('active',b.dataset.page===page);if(b.dataset.page===page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 reset();if(page==='models')ensureModels();
}
window.addEventListener('hashchange',()=>{if(Object.hasOwn(catalogs,location.hash.slice(1))||!location.hash)switchCatalog(pageFromHash())});
function reset(){filter='すべて';query='';$('#search').value='';render()}
function syncSidebar(){const mobile=window.matchMedia('(max-width: 760px)').matches;$('#sidebar').inert=mobile&&!$('#sidebar').classList.contains('open')}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false');syncSidebar()}
document.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||b.disabled)return;if(b.hasAttribute('data-model-retry'))ensureModels(true);else if(b.dataset.modelAngle){const m=catalogs.models.items.find(m=>m.id===$('#detail-dialog').dataset.modelId);if(m)setModelAngle($('#detail-content'),m,b.dataset.modelAngle==='back');}else if(b.dataset.detail)openDetail(b.dataset.detail);else if(b.dataset.filter){filter=b.dataset.filter;render();$(`[data-filter="${filter}"]`)?.focus()}else if(b.dataset.page){switchCatalog(b.dataset.page);closeSidebar()}else if(b.dataset.view){view=b.dataset.view;render();$$('[data-view]').forEach(btn=>{btn.classList.toggle('selected',btn.dataset.view===view);btn.setAttribute('aria-pressed',String(btn.dataset.view===view))})}else if(b.classList.contains('close-dialog'))closeDialog(b.closest('dialog'))});
$('#search').addEventListener('input',e=>{query=e.target.value.trim();render()});
$('#sort').addEventListener('change',e=>{sort=e.target.value;render()});
$('#filter-reset').addEventListener('click',reset);
$('#empty-reset').addEventListener('click',reset);
$('#detail-content').addEventListener('click',e=>{if(e.target.closest('#copy-prompt'))copy($('#prompt-text').value)});
$('#menu-button').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',String(open));syncSidebar()});
document.addEventListener('click',e=>{if(!e.target.closest('#sidebar')&&!e.target.closest('#menu-button'))closeSidebar()});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('input,textarea,[contenteditable]')&&!$('dialog[open]')){e.preventDefault();$('#search').focus()}if(e.key==='Escape')closeSidebar()});
$('#detail-dialog').addEventListener('cancel',e=>{e.preventDefault();closeDialog(e.currentTarget)});
$('#detail-dialog').addEventListener('click',e=>{const dialog=e.currentTarget,r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeDialog(dialog)});
window.matchMedia('(max-width: 760px)').addEventListener('change',syncSidebar);
document.addEventListener('error',e=>{if(e.target.matches?.('.model-image'))e.target.parentElement.classList.add('image-failed');},true);
hydrate();switchCatalog(page);syncSidebar();
