import {useCallback} from 'react';
import {fireEvent, render} from '@testing-library/react';
import {expect, it, vi} from 'vitest';
import {useSidebarSwipe} from '../components/useSidebarSwipe';

const noop = () => {};
function Surface({enabled = true, onOpen}: {enabled?: boolean; onOpen: () => void}) {
  const settle = useCallback((open: boolean) => {if (open) onOpen();}, [onOpen]);
  useSidebarSwipe(enabled, false, noop, settle);
  return <main id="main"><a href="#works">ゲーム</a><button>ボタン</button><input/>
    <div className="banner-window"/><div className="preview-rail"/><p>説明文</p></main>;
}
function touch(x: number, y: number, identifier = 1) {return {identifier, clientX:x, clientY:y};}
function swipe(target: Element, dx = 100, dy = 0) {
  fireEvent.touchStart(target, {touches:[touch(40, 300)]});
  fireEvent.touchMove(target, {touches:[touch(40 + dx, 300 + dy)]});
  fireEvent.touchEnd(target, {touches:[], changedTouches:[touch(40 + dx, 300 + dy)]});
}
it('opens only after a deliberate rightward swipe on empty space', () => {
  const onOpen = vi.fn(); const view = render(<Surface onOpen={onOpen}/>);
  const main = view.container.querySelector('main')!;
  swipe(main, 30); swipe(main, -100); swipe(main, 20, 100); swipe(main, 100, 100);
  expect(onOpen).not.toHaveBeenCalled();
  swipe(main, 100, 8);
  expect(onOpen).toHaveBeenCalledTimes(1);
});
it('leaves links, controls, text and carousels alone', () => {
  const onOpen = vi.fn(); const view = render(<Surface onOpen={onOpen}/>);
  for (const element of view.container.querySelectorAll('a,button,input,.banner-window,.preview-rail,p')) swipe(element);
  expect(onOpen).not.toHaveBeenCalled();
});
it('does not steal a vertical scroll when the finger later moves right', () => {
  const onOpen = vi.fn(); const view = render(<Surface onOpen={onOpen}/>);
  const main = view.container.querySelector('main')!;
  fireEvent.touchStart(main, {touches:[touch(40,300)]});
  fireEvent.touchMove(main, {touches:[touch(42,330)]});
  fireEvent.touchMove(main, {touches:[touch(160,330)]});
  fireEvent.touchEnd(main, {touches:[], changedTouches:[touch(160,330)]});
  expect(onOpen).not.toHaveBeenCalled();
});
it('cancels multi-touch and interrupted gestures and removes disabled listeners', () => {
  const onOpen = vi.fn(); const view = render(<Surface onOpen={onOpen}/>);
  const main = view.container.querySelector('main')!;
  for (const interrupt of ['multi', 'cancel', 'disabled']) {
    fireEvent.touchStart(main, {touches:[touch(40,300)]});
    fireEvent.touchMove(main, {touches:[touch(140,300)]});
    if (interrupt === 'multi') fireEvent.touchStart(main, {touches:[touch(140,300), touch(180,300,2)]});
    if (interrupt === 'cancel') fireEvent.touchCancel(main);
    if (interrupt === 'disabled') view.rerender(<Surface onOpen={onOpen} enabled={false}/>);
    fireEvent.touchEnd(main, {touches:[], changedTouches:[touch(140,300)]});
  }
  swipe(main);
  expect(onOpen).not.toHaveBeenCalled();
});

function Draggable({open = false, onProgress, onSettle}: {open?: boolean; onProgress: (p: number) => void; onSettle: (open: boolean) => void}) {
  useSidebarSwipe(true, open, onProgress, onSettle);
  return <><main id="main"/><aside className="sidebar"><button>ゲーム</button></aside><button className="sidebar-backdrop"/></>;
}
it('tracks finger distance in both directions before release, including reversal', () => {
  const progress = vi.fn(), settle = vi.fn();
  const view = render(<Draggable onProgress={progress} onSettle={settle}/>);
  const main = view.container.querySelector('main')!;
  fireEvent.touchStart(main, {touches:[touch(40,300)]});
  fireEvent.touchMove(main, {touches:[touch(100,300)]});
  expect(progress).toHaveBeenLastCalledWith(60 / 218);
  expect(settle).not.toHaveBeenCalled();
  fireEvent.touchMove(main, {touches:[touch(160,300)]});
  expect(progress).toHaveBeenLastCalledWith(120 / 218);
  fireEvent.touchMove(main, {touches:[touch(50,300)]});
  expect(progress).toHaveBeenLastCalledWith(10 / 218);
  fireEvent.touchEnd(main, {touches:[], changedTouches:[touch(50,300)]});
  expect(settle).toHaveBeenLastCalledWith(false);
  view.rerender(<Draggable open onProgress={progress} onSettle={settle}/>);
  const button = view.container.querySelector('aside button')!;
  fireEvent.touchStart(button, {touches:[touch(180,300)]});
  fireEvent.touchMove(button, {touches:[touch(80,300)]});
  expect(progress).toHaveBeenLastCalledWith(1 - 100 / 218);
  fireEvent.touchEnd(button, {touches:[], changedTouches:[touch(80,300)]});
  expect(settle).toHaveBeenLastCalledWith(false);
  expect(fireEvent.click(button, {detail:1})).toBe(false);
});
it('closes from a backdrop swipe, but preserves vertical menu scrolling', () => {
  const progress = vi.fn(), settle = vi.fn();
  const view = render(<Draggable open onProgress={progress} onSettle={settle}/>);
  swipe(view.container.querySelector('aside button')!, -10, -100);
  expect(progress).not.toHaveBeenCalled();
  expect(settle).not.toHaveBeenCalled();
  swipe(view.container.querySelector('.sidebar-backdrop')!, -100);
  expect(settle).toHaveBeenLastCalledWith(false);
});
