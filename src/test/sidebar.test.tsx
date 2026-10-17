import {StrictMode} from 'react';
import {act, render} from '@testing-library/react';
import {beforeEach, expect, it, vi} from 'vitest';
import {useLiquidSidebar} from '../components/useLiquidSidebar';

let drag: (p: number) => void, settle: (open: boolean) => void;
function Sidebar({open = false, mobile = false, route = 'home'}) {
  const {refs, present, animating, seek, settle: finish} = useLiquidSidebar(open, mobile, route);
  drag = seek; settle = finish;
  return <><aside ref={refs.panel} data-moving={animating}>
    <div ref={refs.reveal}><div ref={refs.content}><span className="sidebar-flow">ホーム</span></div></div>
    <button ref={refs.toggle}>menu</button>
  </aside><div ref={refs.heading}/><div ref={refs.headerLogo}><a className="brand-header"/></div>
  <div ref={refs.workspace} data-testid="workspace"/><button ref={refs.backdrop} hidden={!present}/></>;
}
let now: number, next: number, callbacks: Map<number, FrameRequestCallback>;
beforeEach(() => {
  now = 0; next = 0; callbacks = new Map();
  vi.spyOn(performance, 'now').mockImplementation(() => now);
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {callbacks.set(++next, callback); return next;});
  vi.stubGlobal('cancelAnimationFrame', (id: number) => callbacks.delete(id));
});
function advance(time: number) {
  now = time;
  act(() => {const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(now));});
}
it('reverses from the current position, keeps one clock and cancels on unmount', () => {
  const view = render(<StrictMode><Sidebar/></StrictMode>);
  const workspace = view.getByTestId('workspace');
  view.rerender(<StrictMode><Sidebar open/></StrictMode>);
  expect(callbacks.size).toBe(1);
  advance(260);
  const midway = workspace.style.marginLeft;
  expect(parseFloat(midway)).toBeGreaterThan(0);
  expect(parseFloat(midway)).toBeLessThan(218);
  view.rerender(<StrictMode><Sidebar/></StrictMode>);
  expect(workspace.style.marginLeft).toBe(midway);
  expect(callbacks.size).toBe(1);
  advance(520);
  expect(workspace.style.marginLeft).toBe('0px');
  expect(callbacks.size).toBe(0);
  view.rerender(<StrictMode><Sidebar open/></StrictMode>);
  view.unmount();
  expect(callbacks.size).toBe(0);
});
it('keeps the mobile workspace stationary and reflows correctly across breakpoints', () => {
  const view = render(<Sidebar/>);
  const workspace = view.getByTestId('workspace');
  view.rerender(<Sidebar open/>);
  advance(520);
  expect(workspace.style.marginLeft).toBe('218px');
  view.rerender(<Sidebar open mobile/>);
  expect(workspace.style.marginLeft).toBe('0px');
  view.rerender(<Sidebar mobile/>);
  advance(780);
  expect(workspace.style.marginLeft).toBe('0px');
  expect(view.container.querySelector('aside')?.getAttribute('data-moving')).toBe('true');
  advance(1040);
  expect(view.container.querySelector('aside')?.getAttribute('data-moving')).toBe('false');
});
it('completes immediately for reduced motion, with no scheduled animation', () => {
  vi.stubGlobal('matchMedia', () => ({matches:true}));
  const view = render(<Sidebar/>);
  view.rerender(<Sidebar open/>);
  expect(view.getByTestId('workspace').style.marginLeft).toBe('218px');
  expect(callbacks.size).toBe(0);
});

it('scrubs the actual silhouette and contents and settles back without changing the open prop', () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(120);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(28);
  const view = render(<Sidebar mobile/>);
  const reveal = view.container.querySelector('aside > div') as HTMLElement;
  const text = view.container.querySelector('.sidebar-flow') as HTMLElement;
  act(() => drag(.4)); advance(16);
  const midway = reveal.style.clipPath, textMidway = text.style.transform;
  expect(reveal.style.visibility).toBe('visible');
  act(() => drag(.8)); advance(32);
  expect(reveal.style.clipPath).not.toBe(midway);
  expect(text.style.transform).not.toBe(textMidway);
  expect(view.getByTestId('workspace').style.marginLeft).toBe('0px');
  act(() => settle(false)); advance(600);
  expect(reveal.style.visibility).toBe('hidden');
  expect(callbacks.size).toBe(0);
});
