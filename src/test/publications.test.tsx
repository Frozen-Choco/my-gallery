import {afterEach, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {FeaturedBanner} from '../components/PersonalPages';
import {bannerPose} from '../components/useBannerRotation';
import {featuredPublications, normalizeVideos, type Publication} from '../catalog/publications';

const items: Publication[] = [1,2,3,4,5].map(n => ({id:`game-${n}`, title:`作品${n}`, url:`https://example.com/${n}`, kind:'game'}));
afterEach(() => vi.useRealTimers());

it('selects three latest videos and two games while retaining the full media archive', () => {
  const videos = normalizeVideos({videos:[1,4,2,5,3].map(n => ({id:`video_id_0${n}`,title:`動画${n}`,publishedAt:`2026-10-0${n}T00:00:00Z`}))});
  expect(videos.map(v => v.title)).toEqual(['動画5','動画4','動画3','動画2','動画1']);
  expect(featuredPublications(videos, items).map(v => v.title)).toEqual(['動画5','動画4','動画3','作品1','作品2']);
  expect(videos).toHaveLength(5);
});

it('validates external records and constructs URLs from video IDs only', () => {
  const video = {id:'valid_video',title:'<script>text</script>',publishedAt:'2026-10-01T00:00:00Z',url:'javascript:alert(1)'};
  const result = normalizeVideos({videos:[video, video, {...video,id:'bad'}, {...video,id:'other_video',publishedAt:'bad'}]});
  expect(result).toHaveLength(1);
  expect(result[0].url).toBe('https://www.youtube.com/watch?v=valid_video');
  expect(result[0].title).toBe('<script>text</script>');
});

const cards = () => [...document.querySelectorAll<HTMLAnchorElement>('.banner-slide')];
const centre = () => document.querySelector<HTMLAnchorElement>('.banner-slide[data-slot="0"]')!;
const position = () => Number(screen.getByRole('region', {name:'新着作品'}).dataset.position);
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

it('keeps five cards mounted and cycles clockwise through all positions without a rewind', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const original = cards();
  expect(original).toHaveLength(5);
  expect(original.map(card => Number(card.dataset.slot))).toEqual([0,1,2,-2,-1]);
  expect(centre().href).toBe(items[0].url);
  for (let step=1;step<=5;step++) {
    advance(step === 1 ? 6200 : 5000);
    expect(centre().href).toBe(items[step % 5].url);
    expect(cards()).toEqual(original);
    expect(cards().map(card => Number(card.dataset.slot)).sort()).toEqual([-1,-2,0,1,2].sort());
    expect(screen.getAllByRole('link')).toHaveLength(1);
  }
  expect(original[0].dataset.slot).toBe('0');
  const depths = original.slice(0,3).map(card => parseFloat(card.style.getPropertyValue('--banner-depth')));
  expect(depths[0]).toBeGreaterThan(depths[1]);
  expect(depths[1]).toBeGreaterThan(depths[2]);
});

it('resumes five seconds after selection even while hover and focus remain', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const banner = screen.getByRole('region', {name:'新着作品'});
  fireEvent.mouseEnter(banner); fireEvent.focus(banner);
  act(() => vi.advanceTimersByTime(4000));
  fireEvent.click(screen.getByRole('button', {name:'作品3を表示'}));
  act(() => vi.advanceTimersByTime(4999));
  expect(centre().href).toBe(items[2].url);
  advance(1201);
  expect(centre().href).toBe(items[3].url);
  act(() => vi.advanceTimersByTime(5000));
  expect(centre().href).toBe(items[4].url);
});

it('waits five seconds from the last wheel input, including input too small to turn a card', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  fireEvent.wheel(window, {deltaY:100});
  act(() => vi.advanceTimersByTime(4500));
  fireEvent.wheel(window, {deltaY:1});
  act(() => vi.advanceTimersByTime(4999));
  expect(centre().href).toBe(items[1].url);
  advance(1201);
  expect(centre().href).toBe(items[2].url);
});

it('waits until touch ends before resuming automatic rotation', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  fireEvent.touchStart(window, {touches:[{clientX:200,clientY:100}]});
  act(() => vi.advanceTimersByTime(10000));
  expect(centre().href).toBe(items[0].url);
  fireEvent.touchEnd(window, {changedTouches:[{clientX:100,clientY:100}]});
  act(() => vi.advanceTimersByTime(4999));
  expect(centre().href).toBe(items[1].url);
  advance(1201);
  expect(centre().href).toBe(items[2].url);
});

it('fills missing cards by repetition, including a rotating single work', () => {
  vi.useFakeTimers(); const view = render(<FeaturedBanner items={items.slice(0,1)}/>);
  expect(cards()).toHaveLength(5);
  expect(cards().every(card => card.href === items[0].url)).toBe(true);
  expect(document.querySelector('.banner-dots')).toBeNull();
  const initial = centre();
  advance(6200);
  expect(centre()).not.toBe(initial);
  expect(centre().href).toBe(items[0].url);
  view.rerender(<FeaturedBanner key="two" items={items.slice(0,2)}/>);
  expect(cards().map(card => card.href)).toEqual([items[0].url,items[1].url,items[0].url,items[1].url,items[0].url]);
  expect(document.querySelectorAll('.banner-dots button')).toHaveLength(2);
});

it('brings the exact rear card forward without opening its link, including duplicated works', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items.slice(0,1)}/>);
  const rear = cards()[2];
  expect(fireEvent.click(rear)).toBe(false);
  advance(1200);
  expect(centre()).toBe(rear);
  expect(fireEvent.click(rear)).toBe(true);
  const other = cards()[4];
  fireEvent.keyDown(other, {key:' '});
  advance(1200);
  expect(centre()).toBe(other);
});

it('tracks fractional wheel input continuously, then snaps only after input stops', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  let previous = 0;
  for (let input = 0; input < 15; input++) {
    expect(fireEvent.wheel(window, {deltaY:36})).toBe(false);
    advance(80);
    expect(position()).toBeGreaterThan(previous);
    expect(Math.abs(position() - Math.round(position()))).toBeGreaterThan(.01);
    previous = position();
  }
  expect(position()).toBeGreaterThan(2.6);
  expect(position()).toBeLessThan(3);
  advance(1200);
  expect(position()).toBe(3);
  fireEvent.wheel(window, {deltaX:-120});
  advance(80);
  expect(position()).toBeLessThan(3);
  advance(1200);
  expect(position()).toBe(2);
  expect(fireEvent.wheel(window, {deltaY:100,ctrlKey:true})).toBe(true);
  advance(100);
  expect(position()).toBe(2);
});

it('snaps to the nearest card in both directions, including across the loop boundary', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  fireEvent.wheel(window, {deltaY:60}); advance(1200);
  expect(position()).toBe(0);
  fireEvent.wheel(window, {deltaY:-120}); advance(1200);
  expect(position()).toBe(-1);
  expect(centre().href).toBe(items[4].url);
  fireEvent.wheel(window, {deltaY:240}); advance(1200);
  expect(position()).toBe(0);
  expect(centre().href).toBe(items[0].url);
});

it('keeps the full orbit continuous at the wrap and behind the other cards', () => {
  for (const boundary of [0, 1, 2, 2.5, 3, 4, 5]) {
    const before = bannerPose(boundary - .00001);
    const after = bannerPose(boundary + .00001);
    before.forEach((value, axis) => expect(Math.abs(value - after[axis])).toBeLessThan(.01));
  }
  expect(bannerPose(2.5)[1]).toBeLessThan(-72);
  expect(bannerPose(0)).toEqual(bannerPose(5));
  for (let phase = 0; phase < 5; phase += .01) {
    const [x, z] = bannerPose(phase);
    expect((Math.abs(x) + 27) / (1 - z / 100)).toBeLessThan(50);
  }
});

it('swipes horizontally without following a link and leaves vertical touch scrolling alone', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  fireEvent.touchStart(window, {touches:[{clientX:200,clientY:100}]});
  fireEvent.touchEnd(window, {changedTouches:[{clientX:100,clientY:105}]});
  expect(fireEvent.click(centre())).toBe(false);
  advance(1200);
  expect(centre().href).toBe(items[1].url);
  fireEvent.touchStart(window, {touches:[{clientX:100,clientY:100}]});
  fireEvent.touchEnd(window, {changedTouches:[{clientX:150,clientY:200}]});
  expect(centre().href).toBe(items[1].url);
  fireEvent.touchStart(window, {touches:[{clientX:100,clientY:100}]});
  fireEvent.touchEnd(window, {changedTouches:[{clientX:200,clientY:100}]});
  advance(1200);
  expect(centre().href).toBe(items[0].url);
});

it('follows the finger continuously across cards, reverses directly, and snaps on release only', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  Object.defineProperty(window, 'clientWidth', {value:360});
  fireEvent.touchStart(window, {touches:[{clientX:300,clientY:100}]});
  fireEvent.touchMove(window, {touches:[{clientX:246,clientY:102}]});
  expect(position()).toBeCloseTo(.3);
  advance(1500);
  expect(position()).toBeCloseTo(.3); // A resting finger must not trigger snapping.
  fireEvent.touchMove(window, {touches:[{clientX:48,clientY:105}]});
  expect(position()).toBeCloseTo(1.4);
  fireEvent.touchMove(window, {touches:[{clientX:84,clientY:101}]});
  expect(position()).toBeCloseTo(1.2);
  fireEvent.touchEnd(window, {changedTouches:[{clientX:84,clientY:101}]});
  expect(position()).toBeCloseTo(1.2);
  expect(fireEvent.click(centre())).toBe(false);
  advance(1200);
  expect(position()).toBe(1);
});

it('locks vertical gestures to page scrolling and settles cancelled drags without turning another card', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const window = document.querySelector('.banner-window')!;
  fireEvent.touchStart(window, {touches:[{clientX:200,clientY:100}]});
  expect(fireEvent.touchMove(window, {touches:[{clientX:195,clientY:140}]})).toBe(true);
  fireEvent.touchMove(window, {touches:[{clientX:90,clientY:150}]});
  expect(position()).toBe(0);
  fireEvent.touchCancel(window);
  fireEvent.touchStart(window, {touches:[{clientX:200,clientY:100}]});
  fireEvent.touchMove(window, {touches:[{clientX:152,clientY:101}]});
  expect(position()).toBeCloseTo(.4);
  fireEvent.touchCancel(window);
  advance(1200);
  expect(position()).toBe(0);
});

it('does not auto-rotate with reduced motion and renders nothing for no works', () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  const view = render(<FeaturedBanner items={items}/>);
  act(() => vi.advanceTimersByTime(30000));
  expect(centre().href).toBe(items[0].url);
  expect(position()).toBe(0);
  fireEvent.click(screen.getByRole('button', {name:'作品4を表示'}));
  expect(centre().href).toBe(items[3].url);
  view.rerender(<FeaturedBanner items={[]}/>);
  expect(screen.queryByRole('region', {name:'新着作品'})).toBeNull();
});

function mouseBanner() {
  const banner = document.querySelector<HTMLDivElement>('.banner-window')!;
  Object.defineProperty(banner, 'clientWidth', {value:960});
  Object.assign(banner, {setPointerCapture:vi.fn(), hasPointerCapture:vi.fn(() => true), releasePointerCapture:vi.fn()});
  return banner;
}
const mouse = {pointerId:1, pointerType:'mouse', button:0, buttons:1, clientY:200};

it('drags continuously with the mouse, captures outside movement, snaps on release and resumes autoplay', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const banner = mouseBanner();
  fireEvent.pointerDown(banner, {...mouse,clientX:700});
  fireEvent.pointerMove(banner, {...mouse,clientX:556});
  expect(position()).toBeCloseTo(.3);
  expect(banner.setPointerCapture).toHaveBeenCalledWith(1);
  advance(6000);
  expect(position()).toBeCloseTo(.3);
  fireEvent.pointerMove(banner, {...mouse,clientX:124});
  expect(position()).toBeCloseTo(1.2);
  fireEvent.pointerMove(banner, {...mouse,clientX:220});
  expect(position()).toBeCloseTo(1);
  fireEvent.pointerUp(banner, {...mouse,buttons:0,clientX:172});
  expect(position()).toBeCloseTo(1.1);
  expect(banner.releasePointerCapture).toHaveBeenCalledWith(1);
  expect(fireEvent.click(centre())).toBe(false);
  advance(1200);
  expect(position()).toBe(1);
  advance(5000);
  expect(position()).toBe(2);
});

it('preserves ordinary clicks and ignores right-button dragging', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const banner = mouseBanner();
  fireEvent.pointerDown(centre(), {...mouse,clientX:700});
  fireEvent.pointerMove(banner, {...mouse,clientX:698});
  fireEvent.pointerUp(centre(), {...mouse,buttons:0,clientX:698});
  expect(banner.setPointerCapture).not.toHaveBeenCalled();
  expect(fireEvent.click(centre())).toBe(true);
  fireEvent.pointerDown(banner, {...mouse,button:2,buttons:2,clientX:700});
  fireEvent.pointerMove(banner, {...mouse,buttons:2,clientX:100});
  expect(position()).toBe(0);
});

it('settles a cancelled mouse drag and clears the held state on window blur', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const banner = mouseBanner();
  fireEvent.pointerDown(banner, {...mouse,clientX:700});
  fireEvent.pointerMove(banner, {...mouse,clientX:364});
  fireEvent.pointerCancel(banner, {...mouse,clientX:364});
  advance(1200);
  expect(position()).toBe(1);
  fireEvent.pointerDown(banner, {...mouse,clientX:700});
  fireEvent.pointerMove(banner, {...mouse,clientX:556});
  fireEvent.blur(window);
  advance(1200);
  expect(position()).toBe(1);
  advance(5000);
  expect(position()).toBe(2);
});
