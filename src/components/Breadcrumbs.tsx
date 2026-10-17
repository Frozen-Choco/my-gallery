import {collectionFor, titles} from '../catalog';
import type {SitePage} from '../types';

export function Breadcrumbs({page, onNavigate}: {page: SitePage; onNavigate: (page: SitePage) => void}) {
  if (page === 'home') return null;
  const parent = collectionFor(page);
  const ancestors: SitePage[] = parent && parent !== page ? ['home', parent] : ['home'];
  return <nav className="breadcrumbs" aria-label="パンくずリスト"><ol>
    {ancestors.map(ancestor => <li key={ancestor}><a href={`#${ancestor}`} onClick={event => {
      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {event.preventDefault(); onNavigate(ancestor);}
    }}>{titles[ancestor]}</a></li>)}
    <li><span aria-current="page">{page === 'design-all' || page === 'animation-all' ? 'すべて' : titles[page]}</span></li>
  </ol></nav>;
}
