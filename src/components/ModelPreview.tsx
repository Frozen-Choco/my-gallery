import {useEffect, useRef, useState} from 'react';
import {trackDownload} from '../analytics';
import {formatCount, formatSize} from '../catalog/models';
import type {Model} from '../types';

interface ViewerElement extends HTMLElement {
  src: string;
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  jumpCameraToGoal(): void;
  zoom(steps: number): void;
}
let rendererPromise: Promise<unknown> | undefined;
function loadRenderer() {
  if (customElements.get('model-viewer')) return Promise.resolve();
  const url = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js';
  return rendererPromise ??= import(/* @vite-ignore */ url).catch(error => {rendererPromise = undefined; throw error;});
}
function ImageFrame({src, alt}: {src: string; alt: string}) {
  const [failed, setFailed] = useState(false);
  return <span className={`model-image-frame${failed ? ' image-failed' : ''}`}>
    <img className="model-image" src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)}/>
    <span className="model-image-error">画像を読み込めません</span>
  </span>;
}
export function ModelImage({model, back = false}: {model: Model; back?: boolean}) {
  const src = back ? model.back : model.preview;
  return <ImageFrame key={src} src={src} alt={`${model.ja}の${back ? '背面' : '正面'}`}/>;
}
export function Downloads({model}: {model: Model}) {
  return <div className="model-downloads">
    <a href={model.glb} download={`${model.id}.glb`} onClick={() => trackDownload(model.id, 'glb')} aria-label={`${model.ja}のGLBをダウンロード`}>GLB <span>↓ {formatSize(model.glbBytes)}</span></a>
    <a href={model.blend} download={`${model.id}.blend`} onClick={() => trackDownload(model.id, 'blend')} aria-label={`${model.ja}のBlenderファイルをダウンロード`}>Blend <span>↓ {formatSize(model.blendBytes)}</span></a>
  </div>;
}
export function ModelCard({model, onOpen}: {model: Model; onOpen: () => void}) {
  return <article className="style-card model-card" data-id={model.id}>
    <button className="preview-button model-preview" data-detail={model.id} aria-label={`${model.ja}の詳細を見る`} onClick={onOpen}><ModelImage model={model}/></button>
    <div className="card-info"><button className="card-title" onClick={onOpen}><h2>{model.ja}</h2></button>
      <p className="model-meta">{model.category[0]}</p><Downloads model={model}/>
    </div>
  </article>;
}
export function ModelViewer({model}: {model: Model}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerElement | null>(null);
  const [mode, setMode] = useState<'3d' | 'front' | 'back'>('3d');
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const stage = stageRef.current!, host = hostRef.current!;
    let disposed = false, finished = false, ready = false;
    let viewer: ViewerElement | null = null;
    setState('loading');
    function fail() {
      if (disposed || finished) return;
      finished = true; clearTimeout(timer); viewer?.remove(); viewerRef.current = null; setState('error');
    }
    const timer = setTimeout(fail, 30000);
    // Register before loading the renderer so initial wheel input does not rely
    // on the browser updating a newly inserted shadow-DOM hit-testing region.
    function wheel(event: WheelEvent) {
      if (!ready || disposed || modeRef.current !== '3d' || !viewer || !event.deltaY) return;
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? stage.clientHeight : 1;
      event.preventDefault(); event.stopPropagation(); viewer.zoom(-event.deltaY * unit / 30);
    }
    stage.addEventListener('wheel', wheel, {capture: true, passive: false});
    void loadRenderer().then(() => {
      if (disposed || finished) return;
      viewer = document.createElement('model-viewer') as ViewerElement;
      viewerRef.current = viewer;
      const attributes = {alt: `${model.ja}の3Dモデル`, 'camera-controls': '', a11y: JSON.stringify({'interaction-prompt': 'ドラッグ・タッチ・矢印キーで回転できます'}), 'touch-action': 'pan-y', 'interaction-prompt': 'none', 'camera-orbit': '30deg 70deg auto', 'shadow-intensity': '1', loading: 'eager'};
      Object.entries(attributes).forEach(([key, value]) => viewer!.setAttribute(key, value));
      viewer.addEventListener('load', () => {
        if (disposed || finished) return;
        clearTimeout(timer); ready = true; setState('ready');
      }, {once: true});
      viewer.addEventListener('error', fail, {once: true});
      viewer.src = model.glb; host.append(viewer);
    }).catch(fail);
    return () => {
      disposed = true; clearTimeout(timer); stage.removeEventListener('wheel', wheel, true);
      viewer?.remove(); if (viewerRef.current === viewer) viewerRef.current = null;
    };
  }, [model.glb, model.ja, retry]);
  const is3d = mode === '3d';
  function reset() {
    const viewer = viewerRef.current;
    if (viewer) {viewer.cameraOrbit = '30deg 70deg auto'; viewer.cameraTarget = 'auto auto auto'; viewer.fieldOfView = 'auto'; viewer.jumpCameraToGoal();}
  }
  return <>
    <div className="model-preview model-stage" data-model-stage ref={stageRef}>
      <div className={`model-photo${is3d ? ' hidden' : ''}`}><ModelImage model={model} back={mode === 'back'}/></div>
      <div className={`model-viewer-host${is3d ? '' : ' hidden'}`} ref={hostRef}/>
      <div className={`model-viewer-status${!is3d || state === 'ready' ? ' hidden' : ''}`} role="status">
        {state === 'error' ? <>3Dを表示できません。写真でも確認できます。<button onClick={() => setRetry(n => n + 1)}>再読み込み</button></> : '3Dモデルを読み込んでいます…'}
      </div>
      <button className={`model-camera-reset${is3d && state === 'ready' ? '' : ' hidden'}`} aria-label="視点をリセット" title="視点をリセット" onClick={reset}>↺</button>
    </div>
    <div className="model-angles" aria-label="表示方法">{(['3d', 'front', 'back'] as const).map(value => <button key={value} className={mode === value ? 'active' : ''} aria-pressed={mode === value} onClick={() => setMode(value)}>{({ '3d': '3D', front: '正面', back: '背面' })[value]}</button>)}</div>
    <p className={`model-gesture-hint${is3d ? '' : ' hidden'}`}>ドラッグで回転 · スクロール／ピンチで拡大</p>
  </>;
}
export function ModelDetail({model}: {model: Model}) {
  const dimensions = model.dimensions?.map(n => Number(n.toFixed(3)).toLocaleString('ja-JP')).join(' × ');
  return <div className="detail-layout model-detail">
    <div className="detail-visual"><ModelViewer model={model}/></div>
    <div className="detail-notes"><p className="model-category">{model.category[0]}</p>
      <dl className="model-specs">
        <div><dt>三角形</dt><dd>{formatCount(model.triangles)}</dd></div>
        <div><dt>頂点</dt><dd>{formatCount(model.vertices)}</dd></div>
        {dimensions && <div><dt>寸法（m）</dt><dd>{dimensions}<small>X × Y × Z ／ Blender座標</small></dd></div>}
        {model.blender && <div><dt>制作環境</dt><dd>Blender {model.blender}</dd></div>}
      </dl>
      <Downloads model={model}/>
    </div>
  </div>;
}
