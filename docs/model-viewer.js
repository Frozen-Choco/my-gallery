import {setModelAngle} from './models.js?v=20261016-viewer';

// Load the renderer only when a model detail opens, never for catalog cards.
let rendererPromise;
function loadRenderer(){
 if(customElements.get('model-viewer'))return Promise.resolve();
 return rendererPromise??=import('https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js').catch(error=>{rendererPromise=null;throw error;});
}
export function mountModelDetail(root,model){
 const stage=root.querySelector('[data-model-stage]');
 const host=root.querySelector('.model-viewer-host');
 const photo=root.querySelector('.model-photo');
 const status=root.querySelector('.model-viewer-status');
 const reset=root.querySelector('.model-camera-reset');
 const hint=root.querySelector('.model-gesture-hint');
 let viewer=null,mode='3d',state='loading',disposed=false,generation=0,timer;
 function update(){
  const is3d=mode==='3d';
  host.classList.toggle('hidden',!is3d);
  photo.classList.toggle('hidden',is3d);
  status.classList.toggle('hidden',!is3d||state==='ready');
  reset.classList.toggle('hidden',!is3d||state!=='ready');
  hint.classList.toggle('hidden',!is3d);
  root.querySelectorAll('[data-model-view]').forEach(b=>{
   const active=b.dataset.modelView===mode;
   b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));
  });
 }
 async function start(){
  const current=++generation;
  clearTimeout(timer);viewer?.remove();viewer=null;state='loading';
  status.textContent='3Dモデルを読み込んでいます…';update();
  const alive=()=>!disposed&&current===generation;
  function fail(){
   if(!alive())return;
   generation++;clearTimeout(timer);viewer?.remove();viewer=null;state='error';
   status.innerHTML='3Dを表示できません。写真でも確認できます。<button data-model-viewer-retry>再読み込み</button>';update();
  }
  timer=setTimeout(fail,30000);
  try{
   await loadRenderer();if(!alive())return;
   viewer=document.createElement('model-viewer');
   for(const [key,value] of Object.entries({alt:`${model.ja}の3Dモデル`,'camera-controls':'',a11y:JSON.stringify({'interaction-prompt':'ドラッグ・タッチ・矢印キーで回転できます'}),'touch-action':'pan-y','interaction-prompt':'none','camera-orbit':'30deg 70deg auto','shadow-intensity':'1',loading:'eager'}))viewer.setAttribute(key,value);
   viewer.addEventListener('load',()=>{if(!alive())return;clearTimeout(timer);state='ready';update();},{once:true});
   viewer.addEventListener('error',fail,{once:true});
   viewer.src=model.glb;
   host.append(viewer);
  }catch{fail();}
 }
 function click(event){
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.modelView){
   mode=button.dataset.modelView;
   if(mode!=='3d')setModelAngle(root,model,mode==='back');
   update();
  }else if(button===reset&&viewer){
   viewer.cameraOrbit='30deg 70deg auto';viewer.cameraTarget='auto auto auto';viewer.fieldOfView='auto';viewer.jumpCameraToGoal();
  }else if(button.hasAttribute('data-model-viewer-retry'))start();
 }
 // Register a non-passive listener on the stable light-DOM surface before the
 // async renderer mounts. Route each wheel input once, even before a browser
 // updates its hit-testing region for the newly inserted shadow-DOM controls.
 function wheel(event){
  if(disposed||mode!=='3d'||state!=='ready'||!viewer||!event.deltaY)return;
  const unit=event.deltaMode===1?18:event.deltaMode===2?stage.clientHeight:1;
  event.preventDefault();event.stopPropagation();
  viewer.zoom(-event.deltaY*unit/30);
 }
 stage.addEventListener('wheel',wheel,{capture:true,passive:false});
 root.addEventListener('click',click);start();
 return ()=>{disposed=true;generation++;clearTimeout(timer);root.removeEventListener('click',click);stage.removeEventListener('wheel',wheel,true);viewer?.remove();viewer=null;};
}
