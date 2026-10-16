import {useEffect, useId, useRef, useState} from 'react';
import {compareNames, collectionAllRoutes, collectionLabels, collectionPages, exampleCatalogs} from '../catalog';
import type {CollectionPage, ExampleItem, ExamplePage, SitePage} from '../types';
import {ExampleCard} from './ExampleCard';

interface Preview {page: ExamplePage; item: ExampleItem}
const previewLimit = 8;
function PreviewRow({label, destination, entries, paused, onOpen, onNavigate}: {label: string; destination: SitePage; entries: Preview[]; paused: boolean; onOpen: (entry: Preview) => void; onNavigate: (page: SitePage) => void}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({start:true, end:true, leftHeight:0, rightHeight:0});
  useEffect(() => {
    const rail = ref.current!;
    const previews = [...rail.querySelectorAll<HTMLElement>('.preview-button, .motion-demo, .transition-demo')];
    const update = () => {
      const bounds = rail.getBoundingClientRect();
      const visuals = previews.map(preview => preview.getBoundingClientRect());
      const width = rail.parentElement?.querySelector<HTMLElement>('.rail-arrow')?.offsetWidth || 44;
      // A mixed row can contain previews of different heights. Never cover a title.
      const heightAt = (left: number, right: number) => {
        const visible = visuals.filter(rect => rect.right > left && rect.left < right);
        return visuals.length ? Math.min(...(visible.length ? visible : visuals).map(rect => rect.height)) : 0;
      };
      setEdges({start:rail.scrollLeft <= 4, end:rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4,
        leftHeight:heightAt(bounds.left, bounds.left + width), rightHeight:heightAt(bounds.right - width, bounds.right)});
    };
    update();
    rail.addEventListener('scroll', update, {passive:true});
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(rail);
    previews.forEach(preview => observer?.observe(preview));
    window.addEventListener('resize', update);
    return () => {rail.removeEventListener('scroll', update); observer?.disconnect(); window.removeEventListener('resize', update);};
  }, []);
  function scroll(direction: number) {
    const rail = ref.current!;
    rail.scrollBy({left:direction * Math.max(300, rail.clientWidth * .85), behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  return <section className="preview-row" aria-labelledby={`${id}-title`}>
    <div className="preview-row-heading"><h2 id={`${id}-title`}>{label}</h2><div className="preview-row-actions">
      <a href={`#${destination}`} onClick={event => {if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {event.preventDefault(); onNavigate(destination);}}}>すべて見る <span aria-hidden="true">→</span></a>
    </div></div>
    <div className="preview-rail-frame">
    <div className="preview-rail" ref={ref} id={`${id}-rail`}>
      {entries.slice(0, previewLimit).map(entry => <ExampleCard compact key={`${entry.page}:${entry.item.id}`} page={entry.page} item={entry.item} paused={paused} onOpen={() => onOpen(entry)}/>)}
    </div>
    <button className="rail-arrow rail-arrow-left" style={{height:edges.leftHeight}} aria-label={`${label}を左へ送る`} aria-controls={`${id}-rail`} disabled={edges.start} onClick={() => scroll(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button>
    <button className="rail-arrow rail-arrow-right" style={{height:edges.rightHeight}} aria-label={`${label}を右へ送る`} aria-controls={`${id}-rail`} disabled={edges.end} onClick={() => scroll(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button>
    </div>
  </section>;
}

export function CollectionOverview({collection, paused, onOpen, onNavigate}: {collection: CollectionPage; paused: boolean; onOpen: (entry: Preview) => void; onNavigate: (page: SitePage) => void}) {
  const groups = collectionPages[collection].map(page => ({page, entries:[...exampleCatalogs[page].items].sort(compareNames).map(item => ({page, item}))}));
  const all = groups.flatMap(group => group.entries).sort((a, b) => compareNames(a.item, b.item));
  return <div className="collection-overview">
    <PreviewRow label="すべて" destination={collectionAllRoutes[collection]} entries={all} paused={paused} onOpen={onOpen} onNavigate={onNavigate}/>
    {groups.map(group => <PreviewRow key={group.page} label={collectionLabels[group.page]} destination={group.page} entries={group.entries} paused={paused} onOpen={onOpen} onNavigate={onNavigate}/>)}
  </div>;
}
