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

it('advances and loops from the last banner without animating a rewind', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const track = document.querySelector<HTMLElement>('.banner-track')!;
  expect(track.style.transform).toBe('translateX(-100%)');
  for (let i=0;i<5;i++) act(() => vi.advanceTimersByTime(5000));
  expect(track.style.transform).toBe('translateX(-600%)');
  fireEvent.transitionEnd(track);
  expect(track.style.transform).toBe('translateX(-100%)');
  expect(track.style.transition).toBe('none');
  act(() => vi.advanceTimersByTime(5000));
  expect(track.style.transform).toBe('translateX(-200%)');
});

it('pauses for focus and hover, and offers manual selection', () => {
  vi.useFakeTimers(); render(<FeaturedBanner items={items}/>);
  const banner = screen.getByRole('region', {name:'新着作品'});
  const track = document.querySelector<HTMLElement>('.banner-track')!;
  fireEvent.mouseEnter(banner); act(() => vi.advanceTimersByTime(10000));
  expect(track.style.transform).toBe('translateX(-100%)');
  fireEvent.focus(banner); fireEvent.mouseLeave(banner); act(() => vi.advanceTimersByTime(10000));
  expect(track.style.transform).toBe('translateX(-100%)');
  fireEvent.click(screen.getByRole('button', {name:'作品3を表示'}));
  expect(track.style.transform).toBe('translateX(-300%)');
  fireEvent.blur(banner); act(() => vi.advanceTimersByTime(5000));
  expect(track.style.transform).toBe('translateX(-400%)');
});

it('does not rotate a single item or auto-rotate with reduced motion', () => {
  vi.useFakeTimers(); const view = render(<FeaturedBanner items={items.slice(0,1)}/>);
  expect(screen.queryByRole('button')).toBeNull();
  act(() => vi.advanceTimersByTime(30000));
  expect(document.querySelector<HTMLElement>('.banner-track')!.style.transform).toBe('translateX(-0%)');
  view.unmount();
  vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  render(<FeaturedBanner items={items}/>);
  act(() => vi.advanceTimersByTime(30000));
  expect(document.querySelector<HTMLElement>('.banner-track')!.style.transform).toBe('translateX(-100%)');
});
