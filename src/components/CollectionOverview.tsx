import {useEffect, useId, useRef, useState} from 'react';
import {collectionAllRoutes, collectionLabels, collectionPages, exampleCatalogs} from '../catalog';
import type {CollectionPage, ExampleItem, ExamplePage, SitePage} from '../types';
import {ExampleCard} from './ExampleCard';

interface Preview {page: ExamplePage; item: ExampleItem}
const previewLimit = 8;
function PreviewRow({label, destination, entries, paused, onOpen, onNavigate}: {label: string; destination: SitePage; entries: Preview[]; paused: boolean; onOpen: (entry: Preview) => void; onNavigate: (page: SitePage) => void}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({start:true, end:true});
  useEffect(() => {
    const rail = ref.current!;
    const update = () => setEdges({start:rail.scrollLeft < 2, end:rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2});
    update();
    rail.addEventListener('scroll', update, {passive:true});
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(rail);
    window.addEventListener('resize', update);
    return () => {rail.removeEventListener('scroll', update); observer?.disconnect(); window.removeEventListener('resize', update);};
  }, []);
  function scroll(direction: number) {
    const rail = ref.current!;
    rail.scrollBy({left:direction * Math.max(300, rail.clientWidth * .85), behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  return <section className="preview-row" aria-labelledby={`${id}-title`}>
    <div className="preview-row-heading"><h2 id={`${id}-title`}>{label}</h2><div className="preview-row-actions">
      <button className="rail-arrow" aria-label={`${label}を左へ送る`} aria-controls={`${id}-rail`} disabled={edges.start} onClick={() => scroll(-1)}>←</button>
      <button className="rail-arrow" aria-label={`${label}を右へ送る`} aria-controls={`${id}-rail`} disabled={edges.end} onClick={() => scroll(1)}>→</button>
      <a href={`#${destination}`} onClick={event => {if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {event.preventDefault(); onNavigate(destination);}}}>すべて見る <span aria-hidden="true">→</span></a>
    </div></div>
    <div className="preview-rail" ref={ref} id={`${id}-rail`}>
      {entries.slice(0, previewLimit).map(entry => <ExampleCard key={`${entry.page}:${entry.item.id}`} page={entry.page} item={entry.item} paused={paused} onOpen={() => onOpen(entry)}/>)}
    </div>
  </section>;
}

export function CollectionOverview({collection, paused, onOpen, onNavigate}: {collection: CollectionPage; paused: boolean; onOpen: (entry: Preview) => void; onNavigate: (page: SitePage) => void}) {
  const groups = collectionPages[collection].map(page => ({page, entries:exampleCatalogs[page].items.map(item => ({page, item}))}));
  // Alternate categories so the first rail represents the whole collection.
  const all = Array.from({length:Math.max(...groups.map(group => group.entries.length))}, (_, index) => groups.flatMap(group => group.entries[index] ? [group.entries[index]] : [])).flat();
  return <div className="collection-overview">
    <PreviewRow label="すべて" destination={collectionAllRoutes[collection]} entries={all} paused={paused} onOpen={onOpen} onNavigate={onNavigate}/>
    {groups.map(group => <PreviewRow key={group.page} label={collectionLabels[group.page]} destination={group.page} entries={group.entries} paused={paused} onOpen={onOpen} onNavigate={onNavigate}/>)}
  </div>;
}
