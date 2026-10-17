import {useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import type {PersonalPage, Model} from '../types';
import {collectionPages, exampleCatalogs, titles} from '../catalog';
import {featuredPublications, publishedGames, youtube, type Publication, type Video} from '../catalog/publications';
import {Icon} from './Icon';
import {Pagination, contentPageSize} from './Pagination';
import {Specimen} from './Specimen';
import {ThumbnailSlideshow} from './ThumbnailSlideshow';
import {normalizeModels} from '../catalog/models';
import savedModelCatalog from '../../public/models-catalog.json';
import {useVideos} from './useVideos';
import {bannerIndex, bannerPose, useBannerRotation} from './useBannerRotation';
function GameArtwork({item}: {item: Publication}) {
  if (item.id === 'tomori-labyrinth') return <div className="game-artwork tomori-artwork" aria-hidden="true">
    <svg className="tomori-labyrinth" viewBox="0 0 640 360" fill="none">
      <g stroke="#81795e" strokeWidth="2" opacity=".35">
        <path d="M340 28H604V328H340V264H374V302H576V54H368V118H398V84H548V274H404V240M428 112H520V246H460V210M340 148H398V202H368V232H340M488 140V182"/>
      </g>
      <g stroke="#dfbd78" strokeWidth="3" strokeLinejoin="round">
        <path d="M437 140V126C437 112 457 112 457 126V140M423 150L437 140H457L471 150ZM426 156H468L464 220H430ZM423 228H471"/>
        <path d="M446 173C446 185 436 187 436 198C436 212 458 212 458 198C458 190 451 184 446 173Z" fill="#f6d797" stroke="none"/>
        <path d="M410 185H398M484 185H496M415 161L406 153M479 161L488 153" opacity=".6"/>
      </g>
    </svg>
    <span className="game-artwork-title">灯守と<br/>常夜の迷宮</span>
  </div>;
  return <div className="game-artwork" aria-hidden="true">
    <svg className="cradle-orbits" viewBox="0 0 640 320" fill="none">
      <ellipse cx="390" cy="170" rx="210" ry="84" transform="rotate(-25 390 170)"/>
      <ellipse cx="390" cy="170" rx="170" ry="125" transform="rotate(35 390 170)"/>
      <circle cx="390" cy="170" r="60"/><circle className="cradle-star" cx="530" cy="73" r="5"/>
      <path className="cradle-star" d="m385 149 5 15 15 6-15 5-5 16-5-16-15-5 15-6Z"/>
      <path d="M72 59v10m-5-5h10M565 245v12m-6-6h12M167 256v8m-4-4h8"/>
    </svg>
    <span className="game-artwork-title">{item.id === 'stardust-cradle' ? <>星屑の<br/>ゆりかご</> : item.title}</span>
  </div>;
}

function PublicationArtwork({item}: {item: Publication}) {
  return item.thumbnail ? <img className="publication-image" src={item.thumbnail} alt="" loading="lazy"/> : <GameArtwork item={item}/>;
}

export function FeaturedBanner({items}: {items: Publication[]}) {
  const [interaction, setInteraction] = useState(0);
  const [touching, setTouching] = useState(false);
  const [mouseHeld, setMouseHeld] = useState(false);
  const [mouseDragging, setMouseDragging] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const mouseStart = useRef<{id: number; x: number; stride: number; dragging: boolean; element: HTMLDivElement} | null>(null);
  const touchStart = useRef<{x: number; y: number; axis: 'pending' | 'horizontal' | 'vertical'; stride: number} | null>(null);
  const suppressClickUntil = useRef(0);
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const {position, rotateBy, selectCard, scrollBy, beginDrag, dragTo, endDrag} = useBannerRotation(reduced);
  const step = bannerIndex(position);
  const finishMouse = useCallback((withMomentum = false) => {
    const start = mouseStart.current;
    if (!start) return;
    mouseStart.current = null;
    if (start.dragging) suppressClickUntil.current = performance.now() + 500;
    if (start.element.hasPointerCapture(start.id)) start.element.releasePointerCapture(start.id);
    endDrag(withMomentum && start.dragging);
    setMouseHeld(false);
    setMouseDragging(false);
  }, [endDrag]);
  useEffect(() => {
    const blur = () => finishMouse();
    window.addEventListener('blur', blur);
    return () => window.removeEventListener('blur', blur);
  }, [finishMouse]);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    const visibility = () => setHidden(document.hidden);
    preference.addEventListener('change', change); document.addEventListener('visibilitychange', visibility);
    return () => {preference.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility);};
  }, []);
  useEffect(() => {
    if (!items.length || touching || mouseHeld || hidden || reduced) return;
    // Restart the full reading interval after the last input, even if hover/focus remains.
    const timer = setInterval(() => rotateBy(1), 5000);
    return () => clearInterval(timer);
  }, [items.length, touching, mouseHeld, hidden, reduced, interaction, rotateBy]);
  useEffect(() => {
    const window = windowRef.current;
    if (!window) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // Keep trackpad pinch zoom available.
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      if (mouseStart.current || touchStart.current) return;
      setInteraction(current => current + 1);
      scrollBy(delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.clientHeight : 1));
    };
    window.addEventListener('wheel', wheel, {passive:false});
    return () => window.removeEventListener('wheel', wheel);
  }, [items.length, scrollBy]);
  if (!items.length) return null;
  // Five physical cards remain mounted, even when several show the same work.
  // A card wrapping from the left edge to the right travels behind the others.
  const sequence = Array.from({length:5}, (_, index) => items[index % items.length]);
  const activeItem = sequence[step];
  function selectItem(item: Publication) {
    const distance = (index: number) => Math.abs(((index - position) % 5 + 7.5) % 5 - 2.5);
    const closest = sequence.reduce((best, candidate, index) =>
      candidate.id === item.id && (best < 0 || distance(index) < distance(best)) ? index : best, -1);
    if (closest >= 0) selectCard(closest);
  }
  function recordInteraction() {setInteraction(current => current + 1);}
  function moveTouch(touch: {clientX: number; clientY: number}) {
    const start = touchStart.current;
    if (!start) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (start.axis === 'pending' && Math.max(Math.abs(dx), Math.abs(dy)) >= 8) {
      start.axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
    }
    if (start.axis === 'horizontal') dragTo(-dx / start.stride);
  }
  function finishTouch(withMomentum = false) {
    if (touchStart.current) {
      if (touchStart.current.axis === 'horizontal') suppressClickUntil.current = performance.now() + 500;
      endDrag(withMomentum && touchStart.current.axis === 'horizontal');
    }
    touchStart.current = null;
    setTouching(false);
  }
  return <section className="featured-banner" data-position={position} aria-label="新着作品" aria-roledescription="カルーセル"
    onMouseEnter={recordInteraction} onFocusCapture={recordInteraction}
    onClickCapture={recordInteraction} onKeyDownCapture={recordInteraction}>
    <div className="banner-window" ref={windowRef} data-dragging={mouseDragging || undefined}
      onPointerDown={event => {
        if (event.pointerType !== 'mouse' || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || mouseStart.current) return;
        beginDrag();
        mouseStart.current = {id:event.pointerId, x:event.clientX, stride:Math.max(120, event.currentTarget.clientWidth / 2), dragging:false, element:event.currentTarget};
        setMouseHeld(true);
      }}
      onPointerMove={event => {
        const start = mouseStart.current;
        if (!start || start.id !== event.pointerId) return;
        if (!(event.buttons & 1)) {finishMouse(); return;}
        const dx = event.clientX - start.x;
        if (!start.dragging && Math.abs(dx) >= 6) {
          start.dragging = true;
          // Capture only after dragging starts so ordinary link clicks keep their target.
          event.currentTarget.setPointerCapture(event.pointerId);
          setMouseDragging(true);
        }
        if (start.dragging) {event.preventDefault(); dragTo(-dx / start.stride);}
      }}
      onPointerUp={event => {
        const start = mouseStart.current;
        if (!start || start.id !== event.pointerId) return;
        if (start.dragging) dragTo(-(event.clientX - start.x) / start.stride);
        finishMouse(true);
      }}
      onPointerCancel={event => {if (mouseStart.current?.id === event.pointerId) finishMouse();}}
      onLostPointerCapture={event => {if (mouseStart.current?.id === event.pointerId) finishMouse();}}
      onPointerLeave={() => {if (mouseStart.current && !mouseStart.current.dragging) finishMouse();}}
      onTouchStart={event => {
        const touch = event.touches.length === 1 ? event.touches[0] : null;
        if (!touch) {finishTouch(); setTouching(true); return;}
        beginDrag();
        touchStart.current = {x:touch.clientX, y:touch.clientY, axis:'pending', stride:Math.max(120, event.currentTarget.clientWidth / 2)};
        setTouching(true);
      }}
      onTouchMove={event => {if (event.touches.length === 1) moveTouch(event.touches[0]);}}
      onTouchCancel={() => finishTouch()}
      onTouchEnd={event => {
        if (event.changedTouches[0]) moveTouch(event.changedTouches[0]);
        finishTouch(true);
        if (event.touches.length) setTouching(true);
      }}><div className="banner-track">
      {sequence.map((item, index) => {
        const slot = (index - step + 7) % 5 - 2;
        const [x, z, light] = bannerPose(index - position);
        const active = slot === 0;
        const aligned = Math.abs(position - Math.round(position)) < .01;
        const scale = 100 / (100 - z);
        const style = {
          '--banner-x': `${x * scale * .93}cqw`,
          '--banner-y': `${-z * .075}cqw`,
          '--banner-scale': scale,
          '--banner-tilt': `${x * .14}deg`,
          '--banner-light': Math.max(.32, Math.pow(light, 1.8)),
          // The spotlight sits above the side cards and below the selected card.
          zIndex: Math.round(1000 + z * 10) + (active ? 2000 : 0),
        } as CSSProperties;
        return <a key={`${index}-${item.id}`} className="banner-slide" data-slot={slot} style={style} href={item.url} target="_blank" rel="noopener noreferrer"
          role={active ? undefined : 'button'} aria-label={active ? `${item.title}（新しいタブ）` : `${item.title}を中央に表示`}
          draggable={false}
          onClick={event => {
            if (performance.now() < suppressClickUntil.current) {event.preventDefault(); return;}
            if (!active || !aligned) {event.preventDefault(); selectCard(index);}
          }}
          onKeyDown={event => {if (!active && event.key === ' ') {event.preventDefault(); selectCard(index);}}}>
          <PublicationArtwork item={item}/>{item.kind === 'video' && <span className="banner-title">{item.title}</span>}
        </a>;
      })}
    </div></div>
    <div className="banner-controls">
      <button type="button" aria-label="前の作品" onClick={() => rotateBy(-1)}>‹</button>
      <div className="banner-dots" role="group" aria-label="バナーの表示位置">{items.map((item, index) => <button key={item.id} type="button" aria-label={`${index + 1} / ${items.length}：${item.title}を表示`} aria-pressed={activeItem.id === item.id} onClick={() => selectItem(item)}/>)}</div>
      <button type="button" aria-label="次の作品" onClick={() => rotateBy(1)}>›</button>
    </div>
  </section>;
}

function YouTubeSymbol() {
  return <svg viewBox="0 0 48 34" aria-hidden="true"><rect width="48" height="34" rx="10" fill="currentColor"/><path d="m20 10 12 7-12 7Z" fill="white"/></svg>;
}
export function PublicationList({items, kind}: {items: Publication[]; kind: 'game' | 'video'}) {
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const pages = Math.max(1, Math.ceil(items.length / contentPageSize));
  const current = Math.min(page, pages);
  const start = (current - 1) * contentPageSize;
  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    window.scrollTo({top:0, left:0, behavior:'instant'});
    top.current?.focus({preventScroll:true});
  }, [current]);
  function changePage(next: number) {moveFocus.current = true; setPage(next);}
  return <>
    {items.length > 0 && <div className="results-bar publication-results" ref={top} tabIndex={-1}>
      <p aria-live="polite">{pages > 1 ? `${start + 1}–${Math.min(start + contentPageSize, items.length)} / ${items.length}件` : `${items.length}件`}</p>
    </div>}
    <div className={kind === 'game' ? 'published-games' : 'video-grid'}>{items.slice(start, start + contentPageSize).map(item =>
      <a className={kind === 'game' ? 'published-game' : 'video-card'} key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.title}を${kind === 'game' ? '開く' : 'YouTubeで見る'}（新しいタブ）`}>
        <PublicationArtwork item={item}/><h2>{item.title}{kind === 'game' && <span aria-hidden="true">↗</span>}</h2>
      </a>)}
    </div>
    <Pagination page={current} pages={pages} onChange={changePage}/>
  </>;
}
function MediaPage({videos}: {videos: Video[]}) {
  return <>
    <a className="channel-link" href={youtube.url} target="_blank" rel="noopener noreferrer" aria-label="冷凍チョコのYouTubeチャンネル（新しいタブ）"><YouTubeSymbol/><span>{youtube.name}</span><span aria-hidden="true">↗</span></a>
    <PublicationList items={videos} kind="video"/>
    {!videos.length && <p className="video-empty">まだ投稿動画はありません。</p>}
  </>;
}
const destinations = ['works', 'media', 'design', 'animation', 'models'] as const;
const savedModels = normalizeModels(savedModelCatalog).items;
function PageThumbnail({id, videos, models, offset}: {id: typeof destinations[number]; videos: Video[]; models: Model[]; offset: number}) {
  const modelItems = models.length ? models : savedModels;
  const specimens = id === 'design' || id === 'animation' ? collectionPages[id].flatMap(page => exampleCatalogs[page].items.map(item => ({page, item}))) : [];
  const count = id === 'works' ? publishedGames.length : id === 'media' ? videos.length : id === 'models' ? modelItems.length : specimens.length;
  function renderSlide(index: number) {
    if (id === 'works') return publishedGames[index] ? <PublicationArtwork item={publishedGames[index]}/> : <Icon name="game"/>;
    if (id === 'media') return videos[index] ? <PublicationArtwork item={videos[index]}/> : <span className="media-thumbnail"><YouTubeSymbol/></span>;
    if (id === 'models') return modelItems[index] ? <img className="model-thumbnail" src={modelItems[index].preview} alt="" loading="lazy"/> : <Icon name="cube"/>;
    const {page, item} = specimens[index];
    return <Specimen page={page} item={item} detail/>;
  }
  return <ThumbnailSlideshow count={count} renderSlide={renderSlide} interval={5200 + offset * 350}/>;
}
export function PersonalPages({page, models = []}: {page: PersonalPage; models?: Model[]}) {
  const videos = useVideos();
  if (page === 'works') return <PublicationList items={publishedGames} kind="game"/>;
  if (page === 'media') return <MediaPage videos={videos}/>;
  const featured = featuredPublications(videos);
  return <div className="home-page">
    <FeaturedBanner key={featured.map(item => item.id).join(',')} items={featured}/>
    <section className="page-links" aria-labelledby="home-contents-title">
      <h2 id="home-contents-title" className="home-section-title">コンテンツ</h2>
      {destinations.map((item, index) => <a key={item} href={`#${item}`} className="page-link"><PageThumbnail id={item} videos={videos} models={models} offset={index}/><h3>{titles[item]}<Icon name="arrow"/></h3></a>)}
    </section>
  </div>;
}
