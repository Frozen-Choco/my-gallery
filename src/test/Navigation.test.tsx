import {describe, expect, it, vi} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Breadcrumbs} from '../components/Breadcrumbs';
import {Pagination, pageNumbers} from '../components/Pagination';
import {PublicationList} from '../components/PersonalPages';

describe('shared page navigation', () => {
  it('shows structural breadcrumbs with linked ancestors and an unlinked current page', async () => {
    const onNavigate = vi.fn();
    const {rerender} = render(<Breadcrumbs page="styles" onNavigate={onNavigate}/>);
    const nav = within(screen.getByRole('navigation', {name:'パンくずリスト'}));
    expect(nav.getAllByRole('listitem').map(node => node.textContent)).toEqual(['ホーム','デザイン','ウェブデザイン']);
    expect(nav.getByText('ウェブデザイン').getAttribute('aria-current')).toBe('page');
    expect(nav.queryByRole('link', {name:'ウェブデザイン'})).toBeNull();
    await userEvent.click(nav.getByRole('link', {name:'デザイン'}));
    expect(onNavigate).toHaveBeenCalledWith('design');
    expect(nav.getByRole('link', {name:'ホーム'}).getAttribute('href')).toBe('#home');
    rerender(<Breadcrumbs page="animation-all" onNavigate={onNavigate}/>);
    expect(nav.getAllByRole('listitem').map(node => node.textContent)).toEqual(['ホーム','アニメーション','すべて']);
    rerender(<Breadcrumbs page="works" onNavigate={onNavigate}/>);
    expect(nav.getAllByRole('listitem').map(node => node.textContent)).toEqual(['ホーム','ゲーム']);
    rerender(<Breadcrumbs page="home" onNavigate={onNavigate}/>);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('keeps large pagination compact while exposing the first, last and nearby pages', () => {
    expect(pageNumbers(1, 17)).toEqual([1, 2, 'gap', 17]);
    expect(pageNumbers(9, 17)).toEqual([1, 'gap', 8, 9, 10, 'gap', 17]);
    expect(pageNumbers(17, 17)).toEqual([1, 'gap', 16, 17]);
    expect(pageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
    const {rerender} = render(<Pagination page={9} pages={17} onChange={vi.fn()}/>);
    expect(screen.getByRole('button', {name:'9ページ'}).getAttribute('aria-current')).toBe('page');
    rerender(<Pagination page={1} pages={1} onChange={vi.fn()}/>);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it.each(['game','video'] as const)('paginates %s publications in source order and returns focus to the results', async kind => {
    const user = userEvent.setup();
    const items = Array.from({length:49}, (_, index) => ({id:`item-${index}`, title:`作品 ${index + 1}`, kind, url:`https://example.com/${index}`, thumbnail:'./thumbnail.png'}));
    const {rerender} = render(<PublicationList items={items} kind={kind}/>);
    expect(screen.getByText('1–20 / 49件')).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(20);
    const bottom = within(screen.getByRole('navigation', {name:'ページ送り'}));
    vi.mocked(window.scrollTo).mockClear();
    await user.click(bottom.getByRole('button', {name:'2ページ'}));
    expect(window.scrollTo).toHaveBeenCalledWith({top:0, left:0, behavior:'instant'});
    expect(screen.getByText('21–40 / 49件')).toBeTruthy();
    expect(screen.getAllByRole('heading')[0].textContent).toContain('作品 21');
    expect(document.activeElement).toBe(document.querySelector('.publication-results'));
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getAllByRole('navigation', {name:'ページ送り'})).toHaveLength(1);
    await user.click(bottom.getByRole('button', {name:'次のページ'}));
    expect(screen.getAllByRole('link')).toHaveLength(9);
    expect(screen.getByText('41–49 / 49件')).toBeTruthy();
    expect((bottom.getByRole('button', {name:'次のページ'}) as HTMLButtonElement).disabled).toBe(true);
    rerender(<PublicationList items={items.slice(0, 1)} kind={kind}/>);
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.getByRole('heading').textContent).toContain('作品 1');
  });
});
