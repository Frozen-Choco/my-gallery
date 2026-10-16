import {useEffect, useState, type ReactNode} from 'react';

// Only the current and outgoing previews are mounted, even for large catalogs.
export function ThumbnailSlideshow({count, renderSlide, interval = 5200}: {count: number; renderSlide: (index: number) => ReactNode; interval?: number}) {
  const [position, setPosition] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    const visibility = () => setHidden(document.hidden);
    preference.addEventListener('change', change);
    document.addEventListener('visibilitychange', visibility);
    return () => {preference.removeEventListener('change', change); document.removeEventListener('visibilitychange', visibility);};
  }, []);
  useEffect(() => {
    if (count < 2 || hovered || hidden || reduced) return;
    const timer = setTimeout(() => {setOutgoing(position % count); setPosition((position + 1) % count);}, interval);
    return () => clearTimeout(timer);
  }, [count, position, hovered, hidden, reduced, interval]);
  useEffect(() => {
    if (outgoing === null) return;
    const timer = setTimeout(() => setOutgoing(null), 650);
    return () => clearTimeout(timer);
  }, [position, outgoing]);
  const current = count ? position % count : 0;
  return <div className="thumbnail-slideshow" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div className="page-thumbnail" aria-hidden="true" inert>
      {outgoing !== null && count > 1 && <div className="thumbnail-slide outgoing">{renderSlide(outgoing % count)}</div>}
      <div key={current} className={`thumbnail-slide current${outgoing !== null && !reduced ? ' entering' : ''}`}>{renderSlide(current)}</div>
    </div>
  </div>;
}
