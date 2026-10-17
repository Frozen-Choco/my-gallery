import {useEffect} from 'react';

// Only empty layout surfaces participate; cards and horizontal carousels keep their gestures.
const surfaces = '.workspace, #main, .catalog, .home-page, .page-links, .gallery, .published-games, .video-grid, .collection-overview, .preview-row, .preview-row-heading, .catalog-toolbar, .catalog-search, .filter-row, .results-bar, .site-header, .catalog-heading, .section-title, .site-footer';

export function useSidebarSwipe(enabled: boolean, onOpen: () => void) {
  useEffect(() => {
    if (!enabled) return;
    let gesture: {id: number; x: number; y: number; horizontal: boolean} | null = null;
    const cancel = () => {gesture = null;};
    const start = (event: TouchEvent) => {
      cancel();
      if (event.touches.length !== 1 || !(event.target instanceof Element) ||
          !event.target.matches(surfaces) || document.querySelector('dialog[open]')) return;
      const touch = event.touches[0];
      gesture = {id: touch.identifier, x: touch.clientX, y: touch.clientY, horizontal: false};
    };
    const move = (event: TouchEvent) => {
      if (!gesture) return;
      if (event.touches.length !== 1) {cancel(); return;}
      const touch = event.touches[0];
      if (touch.identifier !== gesture.id) {cancel(); return;}
      const dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
      if (!gesture.horizontal) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
        if (dx <= 0 || dx < Math.abs(dy) * 1.5) {cancel(); return;}
        gesture.horizontal = true;
      }
      if (event.cancelable) event.preventDefault();
    };
    const end = (event: TouchEvent) => {
      const current = gesture;
      cancel();
      if (!current || !current.horizontal || event.touches.length) return;
      const touch = Array.from(event.changedTouches).find(touch => touch.identifier === current.id);
      if (!touch) return;
      const dx = touch.clientX - current.x, dy = Math.abs(touch.clientY - current.y);
      if (dx >= 64 && dx > dy * 1.5) onOpen();
    };
    document.addEventListener('touchstart', start, {passive:true});
    document.addEventListener('touchmove', move, {passive:false});
    document.addEventListener('touchend', end, {passive:true});
    document.addEventListener('touchcancel', cancel, {passive:true});
    window.addEventListener('blur', cancel);
    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
      document.removeEventListener('touchcancel', cancel);
      window.removeEventListener('blur', cancel);
    };
  }, [enabled, onOpen]);
}
