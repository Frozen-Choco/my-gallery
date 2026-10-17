import {useEffect, useState, type CSSProperties} from 'react';
import type {PersonalPage, Model} from '../types';
import {collectionPages, exampleCatalogs, titles} from '../catalog';
import {featuredPublications, publishedGames, youtube, type Publication, type Video} from '../catalog/publications';
import {Icon} from './Icon';
import {Specimen} from './Specimen';
import {ThumbnailSlideshow} from './ThumbnailSlideshow';
import {normalizeModels} from '../catalog/models';
import savedModelCatalog from '../../public/models-catalog.json';
import {useVideos} from './useVideos';
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
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    const visibility = () => setHidden(document.hidden);
    preference.addEventListener('change', change); document.addEventListener('visibilitychange', visibility);
    return () => {preference.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility);};
  }, []);
  useEffect(() => {
    if (!items.length || paused || hidden || reduced) return;
    const timer = setInterval(() => setStep(current => (current + 1) % 5), 5000);
    return () => clearInterval(timer);
  }, [items.length, paused, hidden, reduced]);
  if (!items.length) return null;
  // Five physical cards remain mounted, even when several show the same work.
  // A card wrapping from the left edge to the right travels behind the others.
  const sequence = Array.from({length:5}, (_, index) => items[index % items.length]);
  const activeItem = sequence[step];
  function select(item: Publication) {
    const distance = sequence.findIndex((_, offset) => sequence[(step + offset) % 5].id === item.id);
    if (distance >= 0) setStep(current => (current + distance) % 5);
  }
  return <section className="featured-banner" aria-label="新着作品" aria-roledescription="カルーセル"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}>
    <div className="banner-window"><div className="banner-track">
      {sequence.map((item, index) => {
        const slot = (index - step + 7) % 5 - 2;
        const depth = Math.abs(slot);
        const x = depth === 0 ? 0 : Math.sign(slot) * (depth === 1 ? 24 : 42);
        const z = depth === 0 ? 0 : depth === 1 ? -14 : -32;
        const active = slot === 0;
        const style = {'--banner-x':`${x}cqw`, '--banner-depth':`${z}cqw`, '--banner-light':depth === 0 ? 1 : depth === 1 ? .9 : .8, transition:reduced ? 'none' : undefined} as CSSProperties;
        return <a key={`${index}-${item.id}`} className="banner-slide" data-slot={slot} style={style} href={item.url} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1} aria-hidden={!active} aria-label={`${item.title}（新しいタブ）`}>
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
