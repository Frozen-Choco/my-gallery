import {createRef, useCallback, useLayoutEffect, useRef, useState} from 'react';

const smooth = (value: number) => value * value * (3 - 2 * value);
type Fragment = {node: HTMLElement; x: number; y: number; width: number};

/** One animation clock drives the silhouette, its contents and desktop layout. */
export function useLiquidSidebar(open: boolean, mobile: boolean, route: string) {
  const [refs] = useState(() => ({
    panel: createRef<HTMLElement>(), content: createRef<HTMLDivElement>(),
    reveal: createRef<HTMLDivElement>(), toggle: createRef<HTMLButtonElement>(),
    workspace: createRef<HTMLDivElement>(), heading: createRef<HTMLDivElement>(),
    headerLogo: createRef<HTMLDivElement>(), backdrop: createRef<HTMLButtonElement>(),
  }));
  const progress = useRef(0);
  const controller = useRef<{seek: (value: number) => void; settle: (open: boolean) => void} | null>(null);
  const seek = useCallback((value: number) => controller.current?.seek(value), []);
  const settle = useCallback((nextOpen: boolean) => controller.current?.settle(nextOpen), []);
  const [present, setPresent] = useState(open);
  const [animating, setAnimating] = useState(false);

  useLayoutEffect(() => {
    const panel = refs.panel.current!, content = refs.content.current!;
    const reveal = refs.reveal.current!, toggle = refs.toggle.current!;
    const workspace = refs.workspace.current!, heading = refs.heading.current!;
    const headerLogo = refs.headerLogo.current!.querySelector<HTMLElement>('.brand-header')!;
    const backdrop = refs.backdrop.current!;
    let frame = 0;
    let dimensions = {width:218, height:window.innerHeight, inset:mobile ? 18 : 27.5, mobile};
    let fragments: Fragment[] = [];
    function measure() {
      dimensions = {width:content.offsetWidth || 218, height:panel.clientHeight || window.innerHeight, inset:toggle.offsetTop || (mobile ? 18 : 27.5), mobile};
      const scrollTop = content.scrollTop;
      fragments = Array.from(content.querySelectorAll<HTMLElement>('.brand, .sidebar-flow, .sidebar-divider, .privacy-link')).map(node => {
        let x = node.offsetWidth / 2, y = node.offsetHeight / 2;
        let parent: HTMLElement | null = node;
        while (parent && parent !== panel) {
          x += parent.offsetLeft; y += parent.offsetTop;
          parent = parent.offsetParent as HTMLElement | null;
        }
        return {node, x, y:y - scrollTop, width:node.offsetWidth};
      }).filter(item => item.width > 0);
    }
    function paint(p: number) {
      progress.current = p;
      const {width, height, inset, mobile} = dimensions;
      // First grow the button to the screen edges. Only then push the workspace.
      const contact = smooth(Math.min(1, p / .3));
      const growth = smooth(Math.max(0, (p - .3) / .7));
      const shift = mobile ? 0 : width * growth;
      const left = inset * (1 - contact);
      const top = inset * (1 - contact);
      const bottom = inset + 44 + (height - inset - 44) * Math.pow(p, 1.15);
      const buttonX = inset + (width - inset) * growth;
      // The body stays left of the button; only the joint extends beneath
      // its rounded corners to meet the straight top and bottom edges.
      const neckLength = Math.min(18 * Math.sin(Math.PI * p), (buttonX - left) * .35);
      const bodyRight = buttonX - neckLength;
      const buttonLeftRadius = 10 * (1 - contact);
      const jointX = buttonX + buttonLeftRadius;
      const sinkX = buttonX;
      const sinkY = inset + 22;

      // Keep the balloon-like neck local to the button; the body follows the
      // screen edges instead of turning into one large oval.
      const upperY = inset, lowerY = inset + 44;
      const settle = smooth(Math.max(0, (p - .55) / .45));
      const fluid = 1 - settle;
      const corner = Math.min(buttonLeftRadius, (bodyRight - left) / 2);
      const joinTop = Math.max(top + corner, upperY - 20 * fluid);
      const joinBottom = Math.min(bottom - corner, lowerY + 48 * fluid);
      // Underlap the opaque button to avoid an antialiased seam between layers.
      const seamX = jointX + 1.25;
      const contour = `M ${seamX} ${upperY} L ${jointX} ${upperY}
        C ${jointX} ${upperY}, ${bodyRight} ${upperY}, ${bodyRight} ${joinTop}
        V ${top + corner} Q ${bodyRight} ${top} ${bodyRight - corner} ${top}
        H ${left + corner} Q ${left} ${top} ${left} ${top + corner}
        V ${bottom - corner} Q ${left} ${bottom} ${left + corner} ${bottom}
        H ${bodyRight - corner} Q ${bodyRight} ${bottom} ${bodyRight} ${bottom - corner}
        V ${joinBottom}
        C ${bodyRight} ${lowerY + 20 * fluid}, ${Math.max(left, bodyRight - 10 * fluid)} ${lowerY}, ${jointX} ${lowerY} L ${seamX} ${lowerY} Z`;
      reveal.style.visibility = p === 0 ? 'hidden' : 'visible';
      reveal.style.clipPath = `path("${contour.replace(/\s+/g, ' ')}")`;
      for (const {node, x, y, width: itemWidth} of fragments) {
        const distance = Math.min(1, Math.max(0, (y - sinkY) / height));
        const across = Math.min(1, Math.max(0, x / width));
        // Objects follow separate streamlines. Nearby objects reach the mouth
        // first; distant objects follow without rotating or stretching.
        const arrival = .42 - .18 * distance + .03 * across;
        const q = Math.max(0, Math.min(1, (p - arrival) / (1 - arrival)));
        const t = Math.pow(q, .72);
        const u = 1 - t;
        const lane = .18 + across * .46;
        const c1x = left + (bodyRight - left) * lane;
        const destinationX = left + (bodyRight - left) * across;
        const c2x = destinationX - (bodyRight - left) * .12 * (1 - across) * distance;
        const c2y = sinkY + (y - sinkY) * .58;
        const centerX = u*u*u*sinkX + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*destinationX;
        const centerY = u*u*u*sinkY + 3*u*u*t*sinkY + 3*u*t*t*c2y + t*t*t*y;
        // Preserve proportions while floating. Only contract near the mouth;
        // fit the narrow stream without clamping the centre onto a straight line.
        const mouthScale = smooth(Math.min(1, q / .52));
        const space = Math.max(0, Math.min(centerX - left, bodyRight - centerX));
        const fit = Math.min(1, Math.max(0, space * 2 - 4 * (1 - t)) / itemWidth);
        const scale = Math.min(mouthScale, Math.max(0, fit));
        node.style.transform = `translate3d(${centerX - x}px,${centerY - y}px,0) scale(${scale})`;
      }
      toggle.style.transform = `translate3d(${buttonX}px,0,0)`;
      toggle.style.borderRadius = `${buttonLeftRadius}px ${10 + 2 * growth}px ${10 + 2 * growth}px ${buttonLeftRadius}px`;
      workspace.style.marginLeft = `${shift}px`;
      heading.style.transform = `translate3d(${shift}px,0,0)`;
      headerLogo.style.transform = `translate(${shift}px,-50%)`;
      backdrop.style.opacity = String(mobile ? .15 * p : 0);
    }
    function refresh() {measure(); paint(progress.current);}
    refresh();
    const observer = new ResizeObserver(refresh);
    observer.observe(panel);
    observer.observe(content);
    // Fonts may settle after the first measurement; scroll offsets also change
    // the starting positions of the floating items.
    content.addEventListener('scroll', refresh, {passive:true});
    let disposed = false;
    void document.fonts?.ready.then(() => {if (!disposed) refresh();});

    function animate(nextOpen: boolean) {
      cancelAnimationFrame(frame);
      const from = progress.current, to = nextOpen ? 1 : 0;
      const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520 * Math.abs(to - from);
      const finish = () => {paint(to); setPresent(nextOpen); setAnimating(false);};
      if (!duration) {finish(); return;}
      setPresent(true); setAnimating(true);
      const start = performance.now();
      function tick(now: number) {
        const t = Math.min((now - start) / duration, 1);
        paint(from + (to - from) * smooth(t));
        if (t < 1) frame = requestAnimationFrame(tick);
        else finish();
      }
      frame = requestAnimationFrame(tick);
    }
    controller.current = {
      seek(value) {
        cancelAnimationFrame(frame);
        setPresent(true); setAnimating(true);
        // Keep the latest finger position even if release precedes the next frame.
        progress.current = Math.max(0, Math.min(1, value));
        frame = requestAnimationFrame(() => paint(progress.current));
      },
      settle: animate,
    };
    animate(open);
    // Keep keyboard focus on the persistent toggle when a mobile nav item
    // closes the menu. No focus stealing on ordinary desktop navigation.
    if (!open && content.contains(document.activeElement)) toggle.focus({preventScroll:true});
    return () => {
      disposed = true;
      controller.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      content.removeEventListener('scroll', refresh);
    };
  }, [open, mobile, route, refs]);
  return {refs, present, animating, seek, settle};
}
