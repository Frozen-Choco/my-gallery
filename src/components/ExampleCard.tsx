import {animatedPage} from '../catalog';
import type {ExampleItem, ExamplePage} from '../types';
import {Specimen} from './Specimen';

export function ExampleCard({page, item, paused, onOpen, compact = false}: {page: ExamplePage; item: ExampleItem; paused: boolean; onOpen: () => void; compact?: boolean}) {
  const Heading = compact ? 'h3' : 'h2';
  const animated = animatedPage(page);
  return <article className={`style-card${animated ? ' motion-card' : ''}`} data-id={item.id}>
    {animated ? <Specimen page={page} item={item} paused={paused} onOpen={onOpen}/> : <button className="preview-button" data-detail={item.id} aria-label={`${item.name} の見本と特徴を見る`} onClick={onOpen}><Specimen page={page} item={item}/></button>}
    <div className="card-info"><button className="card-title" onClick={onOpen}><Heading>{item.ja}</Heading></button>{!compact && <p className="card-description">{item.description}</p>}</div>
  </article>;
}
