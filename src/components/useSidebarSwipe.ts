import {useEffect, useRef} from 'react';

const surfaces = '.workspace, #main, .catalog, .home-page, .page-links, .gallery, .published-games, .video-grid, .collection-overview, .preview-row, .preview-row-heading, .catalog-toolbar, .catalog-search, .filter-row, .results-bar, .site-header, .catalog-heading, .section-title, .site-footer';

/** Empty space opens the menu; a leftward drag on the menu or its backdrop closes it. */
export function useSidebarSwipe(enabled: boolean, open: boolean, onProgress: (progress: number) => void, onSettle: (open: boolean) => void) {
  const suppressClickUntil = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    let gesture: {id: number; x: number; y: number; width: number; horizontal: boolean; progress: number} | null = null;
    const cancel = () => {
      if (gesture?.horizontal) onSettle(open);
      gesture = null;
    };
    const start = (event: TouchEvent) => {
      cancel();
      if (event.touches.length !== 1 || !(event.target instanceof Element) || document.querySelector('dialog[open]')) return;
      const target = event.target;
      const eligible = open ? target.closest('.sidebar, .sidebar-backdrop') && !target.closest('input,textarea,select,[contenteditable]') : target.matches(surfaces);
      if (!eligible) return;
      const touch = event.touches[0];
      const width = document.querySelector<HTMLElement>('.sidebar-content')?.offsetWidth || 218;
      gesture = {id:touch.identifier, x:touch.clientX, y:touch.clientY, width, horizontal:false, progress:open ? 1 : 0};
    };
    const move = (event: TouchEvent) => {
      if (!gesture) return;
      if (event.touches.length !== 1) {cancel(); return;}
      const touch = event.touches[0];
      if (touch.identifier !== gesture.id) {cancel(); return;}
      const dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
      if (!gesture.horizontal) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return;
        if ((open ? dx >= 0 : dx <= 0) || Math.abs(dx) < Math.abs(dy) * 1.5) {gesture = null; return;}
        gesture.horizontal = true;
      }
      if (event.cancelable) event.preventDefault();
      gesture.progress = Math.max(0, Math.min(1, (open ? 1 : 0) + dx / gesture.width));
      onProgress(gesture.progress);
    };
    const end = (event: TouchEvent) => {
      if (!gesture) return;
      if (event.touches.length) {cancel(); return;}
      const current = gesture;
      gesture = null;
      if (!current.horizontal) return;
      const touch = Array.from(event.changedTouches).find(touch => touch.identifier === current.id);
      const dx = touch ? touch.clientX - current.x : 0;
      const dy = touch ? Math.abs(touch.clientY - current.y) : Infinity;
      suppressClickUntil.current = performance.now() + 500;
      // Returning near the starting point cancels; short drags spring back smoothly.
      const completed = (open ? -dx : dx) >= 64 && Math.abs(dx) > dy * 1.5;
      onSettle(completed ? !open : open);
    };
    const click = (event: MouseEvent) => {
      if (event.detail > 0 && performance.now() < suppressClickUntil.current) {event.preventDefault(); event.stopPropagation();}
    };
    document.addEventListener('touchstart', start, {passive:true});
    document.addEventListener('touchmove', move, {passive:false});
    document.addEventListener('touchend', end, {passive:true});
    document.addEventListener('touchcancel', cancel, {passive:true});
    document.addEventListener('click', click, true);
    window.addEventListener('blur', cancel);
    return () => {
      document.removeEventListener('touchstart', start);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
      document.removeEventListener('touchcancel', cancel);
      document.removeEventListener('click', click, true);
      window.removeEventListener('blur', cancel);
      gesture = null;
    };
  }, [enabled, open, onProgress, onSettle]);
}
