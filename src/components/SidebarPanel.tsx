import {useLayoutEffect, useRef, type ReactNode} from 'react';

/** Measure only on resize; the opening/closing frames use compositor transforms. */
export function SidebarPanel({children}: {children: ReactNode}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const surface = ref.current;
    if (!surface) return;
    const resize = () => {
      if (!surface.offsetWidth || !surface.offsetHeight) return;
      surface.style.setProperty('--closed-scale-x', String(44 / surface.offsetWidth));
      surface.style.setProperty('--closed-scale-y', String(44 / surface.offsetHeight));
    };
    resize();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize);
      return () => window.removeEventListener('resize', resize);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="sidebar-panel">{children}</div>;
}
