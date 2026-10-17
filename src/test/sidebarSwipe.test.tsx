import {fireEvent, render} from '@testing-library/react';
import {expect, it, vi} from 'vitest';
import {useSidebarSwipe} from '../components/useSidebarSwipe';

function Surface({enabled = true, onOpen}: {enabled?: boolean; onOpen: () => void}) {
  useSidebarSwipe(enabled, onOpen);
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
