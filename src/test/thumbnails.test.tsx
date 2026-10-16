import {afterEach, expect, it, vi} from 'vitest';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {ThumbnailSlideshow} from '../components/ThumbnailSlideshow';

afterEach(() => vi.useRealTimers());
const preview = (index: number) => <span>見本{index}</span>;
const current = () => document.querySelector('.thumbnail-slide.current')?.textContent;

it('crossfades each preview and loops, mounting at most two items from a large catalog', () => {
  vi.useFakeTimers();
  const view = render(<ThumbnailSlideshow count={1000} renderSlide={preview}/>);
  expect(current()).toBe('見本0');
  act(() => vi.advanceTimersByTime(5200));
  expect(current()).toBe('見本1');
  expect(document.querySelectorAll('.thumbnail-slide')).toHaveLength(2);
  act(() => vi.advanceTimersByTime(650));
  expect(document.querySelectorAll('.thumbnail-slide')).toHaveLength(1);
  view.rerender(<ThumbnailSlideshow count={2} renderSlide={preview}/>);
  act(() => vi.advanceTimersByTime(5200));
  expect(current()).toBe('見本0');
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('keeps the destination link stable, pauses on hover, and skips automatic movement for reduced motion', () => {
  vi.useFakeTimers();
  const view = render(<a href="#styles">デザインスタイル<ThumbnailSlideshow count={3} renderSlide={preview}/></a>);
  const link = screen.getByRole('link', {name:'デザインスタイル'});
  fireEvent.mouseEnter(document.querySelector('.thumbnail-slideshow')!);
  act(() => vi.advanceTimersByTime(20000));
  expect(current()).toBe('見本0');
  fireEvent.mouseLeave(document.querySelector('.thumbnail-slideshow')!);
  act(() => vi.advanceTimersByTime(5200));
  expect(current()).toBe('見本1');
  expect(link.getAttribute('href')).toBe('#styles');
  view.unmount();
  vi.stubGlobal('matchMedia', () => ({matches:true,addEventListener:vi.fn(),removeEventListener:vi.fn()}));
  render(<ThumbnailSlideshow count={3} renderSlide={preview}/>);
  act(() => vi.advanceTimersByTime(20000));
  expect(current()).toBe('見本0');
});

it('does not start a timer for an empty or single-item catalog', () => {
  vi.useFakeTimers();
  const view = render(<ThumbnailSlideshow count={0} renderSlide={() => <span>未投稿</span>}/>);
  expect(vi.getTimerCount()).toBe(0);
  view.rerender(<ThumbnailSlideshow count={1} renderSlide={preview}/>);
  expect(vi.getTimerCount()).toBe(0);
});
