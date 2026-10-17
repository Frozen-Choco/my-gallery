import {afterEach, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {FeaturedBanner} from '../components/PersonalPages';
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

it('keeps five cards mounted and cycles clockwise through all positions without a rewind', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const original = cards();
  expect(original).toHaveLength(5);
  expect(original.map(card => Number(card.dataset.slot))).toEqual([0,1,2,-2,-1]);
  expect(centre().href).toBe(items[0].url);
  for (let step=1;step<=5;step++) {
    act(() => vi.advanceTimersByTime(5000));
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

it('pauses for focus and hover, and offers manual selection', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const banner = screen.getByRole('region', {name:'新着作品'});
  fireEvent.mouseEnter(banner); act(() => vi.advanceTimersByTime(10000));
  expect(centre().href).toBe(items[0].url);
  fireEvent.focus(banner); fireEvent.mouseLeave(banner); act(() => vi.advanceTimersByTime(10000));
  expect(centre().href).toBe(items[0].url);
  fireEvent.click(screen.getByRole('button', {name:'作品3を表示'}));
  expect(centre().href).toBe(items[2].url);
  fireEvent.blur(banner); act(() => vi.advanceTimersByTime(5000));
  expect(centre().href).toBe(items[3].url);
});

it('fills missing cards by repetition, including a rotating single work', () => {
  vi.useFakeTimers(); const view = render(<FeaturedBanner items={items.slice(0,1)}/>);
  expect(cards()).toHaveLength(5);
  expect(cards().every(card => card.href === items[0].url)).toBe(true);
  expect(screen.queryByRole('button')).toBeNull();
  const initial = centre();
  act(() => vi.advanceTimersByTime(5000));
  expect(centre()).not.toBe(initial);
  expect(centre().href).toBe(items[0].url);
  view.rerender(<FeaturedBanner key="two" items={items.slice(0,2)}/>);
  expect(cards().map(card => card.href)).toEqual([items[0].url,items[1].url,items[0].url,items[1].url,items[0].url]);
  expect(screen.getAllByRole('button')).toHaveLength(2);
});

it('does not auto-rotate with reduced motion and renders nothing for no works', () => {
  vi.useFakeTimers();
  vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  const view = render(<FeaturedBanner items={items}/>);
  act(() => vi.advanceTimersByTime(30000));
  expect(centre().href).toBe(items[0].url);
  expect(cards().every(card => card.style.transition === 'none')).toBe(true);
  fireEvent.click(screen.getByRole('button', {name:'作品4を表示'}));
  expect(centre().href).toBe(items[3].url);
  view.rerender(<FeaturedBanner items={[]}/>);
  expect(screen.queryByRole('region', {name:'新着作品'})).toBeNull();
});
