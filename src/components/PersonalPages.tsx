import {useEffect, useRef, useState, type CSSProperties} from 'react';
import type {PersonalPage, Model} from '../types';
import {collectionPages, exampleCatalogs, titles} from '../catalog';
import {featuredPublications, publishedGames, youtube, type Publication, type Video} from '../catalog/publications';
import {Icon} from './Icon';
import {Specimen} from './Specimen';
import {ThumbnailSlideshow} from './ThumbnailSlideshow';
import {normalizeModels} from '../catalog/models';
import savedModelCatalog from '../../public/models-catalog.json';
import {useVideos} from './useVideos';
import {bannerIndex, bannerPose, useBannerRotation} from './useBannerRotation';
function GameArtwork() {
  return <div className="game-artwork" aria-hidden="true">
    <svg className="cradle-orbits" viewBox="0 0 640 320" fill="none">
      <ellipse cx="390" cy="170" rx="210" ry="84" transform="rotate(-25 390 170)"/>
      <ellipse cx="390" cy="170" rx="170" ry="125" transform="rotate(35 390 170)"/>
      <circle cx="390" cy="170" r="60"/><circle className="cradle-star" cx="530" cy="73" r="5"/>
      <path className="cradle-star" d="m385 149 5 15 15 6-15 5-5 16-5-16-15-5 15-6Z"/>
      <path d="M72 59v10m-5-5h10M565 245v12m-6-6h12M167 256v8m-4-4h8"/>
    </svg>
    <span className="game-artwork-title">星屑の<br/>ゆりかご</span>
  </div>;
}

function PublicationArtwork({item}: {item: Publication}) {
  return item.thumbnail ? <img className="publication-image" src={item.thumbnail} alt="" loading="lazy"/> : <GameArtwork/>;
}

export function FeaturedBanner({items}: {items: Publication[]}) {
  const [interaction, setInteraction] = useState(0);
  const [touching, setTouching] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{x: number; y: number} | null>(null);
  const suppressClickUntil = useRef(0);
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const {position, rotateBy, selectCard, scrollBy} = useBannerRotation(reduced);
  const step = bannerIndex(position);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    const visibility = () => setHidden(document.hidden);
    preference.addEventListener('change', change); document.addEventListener('visibilitychange', visibility);
    return () => {preference.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility);};
  }, []);
  useEffect(() => {
    if (!items.length || touching || hidden || reduced) return;
    // Restart the full reading interval after the last input, even if hover/focus remains.
    const timer = setInterval(() => rotateBy(1), 5000);
    return () => clearInterval(timer);
  }, [items.length, touching, hidden, reduced, interaction, rotateBy]);
  useEffect(() => {
    const window = windowRef.current;
    if (!window) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // Keep trackpad pinch zoom available.
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
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
  function select(item: Publication) {
    const distance = sequence.findIndex((_, offset) => sequence[(step + offset) % 5].id === item.id);
    if (distance >= 0) selectCard((step + distance) % 5);
  }
  function recordInteraction() {setInteraction(current => current + 1);}
  return <section className="featured-banner" data-position={position} aria-label="新着作品" aria-roledescription="カルーセル"
    onMouseEnter={recordInteraction} onFocusCapture={recordInteraction}
    onClickCapture={recordInteraction} onKeyDownCapture={recordInteraction}>
    <div className="banner-window" ref={windowRef}
      onTouchStart={event => {
        const touch = event.touches.length === 1 ? event.touches[0] : null;
        touchStart.current = touch ? {x:touch.clientX, y:touch.clientY} : null;
        setTouching(!!touch);
      }}
      onTouchCancel={() => {touchStart.current = null; setTouching(false);}}
      onTouchEnd={event => {
        const start = touchStart.current;
        const end = event.changedTouches[0];
        touchStart.current = null;
        setTouching(false);
        if (!start || !end) return;
        const dx = end.clientX - start.x;
        const dy = end.clientY - start.y;
        if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
        suppressClickUntil.current = performance.now() + 500;
        rotateBy(dx < 0 ? 1 : -1);
      }}><div className="banner-track">
      {sequence.map((item, index) => {
        const slot = (index - step + 7) % 5 - 2;
        const [x, z, light] = bannerPose(index - position);
        const active = slot === 0;
        const aligned = Math.abs(position - Math.round(position)) < .01;
        const style = {'--banner-x':`${x}cqw`, '--banner-depth':`${z}cqw`, '--banner-light':light, zIndex:Math.round(1000 + z * 10)} as CSSProperties;
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
    {items.length > 1 && <div className="banner-dots">{items.map(item => <button key={item.id} aria-label={`${item.title}を表示`} aria-pressed={activeItem.id === item.id} onClick={() => select(item)}/>)}</div>}
  </section>;
}

function YouTubeSymbol() {
  return <svg viewBox="0 0 48 34" aria-hidden="true"><rect width="48" height="34" rx="10" fill="currentColor"/><path d="m20 10 12 7-12 7Z" fill="white"/></svg>;
}
function MediaPage({videos}: {videos: Video[]}) {
  return <>
    <a className="channel-link" href={youtube.url} target="_blank" rel="noopener noreferrer" aria-label="冷凍チョコのYouTubeチャンネル（新しいタブ）"><YouTubeSymbol/><span>{youtube.name}</span><span aria-hidden="true">↗</span></a>
    <div className="video-grid">{videos.map(video => <a className="video-card" key={video.id} href={video.url} target="_blank" rel="noopener noreferrer"><PublicationArtwork item={video}/><h2>{video.title}</h2></a>)}</div>
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
  if (page === 'works') return <div className="published-games">{publishedGames.map(game => <a key={game.id} className="published-game" href={game.url} target="_blank" rel="noopener noreferrer" aria-label={`${game.title}をitch.ioで見る（新しいタブ）`}><PublicationArtwork item={game}/><h2>{game.title}<span aria-hidden="true">↗</span></h2></a>)}</div>;
  if (page === 'media') return <MediaPage videos={videos}/>;
  const featured = featuredPublications(videos);
  return <div className="home-page">
    <FeaturedBanner key={featured.map(item => item.id).join(',')} items={featured}/>
    <div className="page-links">{destinations.map((item, index) => <a key={item} href={`#${item}`} className="page-link"><PageThumbnail id={item} videos={videos} models={models} offset={index}/><h2>{titles[item]}<Icon name="arrow"/></h2></a>)}</div>
  </div>;
}
