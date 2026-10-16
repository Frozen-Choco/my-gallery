import {StrictMode} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {App} from '../App';
import {FakeViewer} from './setup';
import {trackDetail, trackDownload} from '../analytics';

vi.mock('../components/useVideos', () => ({useVideos: () => []}));

vi.mock('../analytics', () => ({trackPage:vi.fn(), trackDetail:vi.fn(), trackDownload:vi.fn()}));

beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true, json:async () => []})));

function renderApp() {return render(<StrictMode><App/></StrictMode>);}
function fixtureModels(count: number) {
  return Array.from({length: count}, (_, i) => ({id: `model_${String(i + 1).padStart(4,'0')}`, title_ja: `モデル ${String(i + 1).padStart(4,'0')}`, category: i % 2 ? 'household' : 'furniture', triangles: 640, vertices: 352, dimensions_m: [1, 2, 3], glb_bytes: 1000, blend_bytes: 2000, blender_version: '4.3.2'}));
}
describe('catalog interaction after the React migration', () => {
  it('separates published games from game design and groups both animation pages', async () => {
    const user = userEvent.setup(); renderApp();
    await user.click(screen.getByRole('button', {name:'メニューを開く'}));
    const design = screen.getByRole('group', {name:'デザイン'});
    const animation = screen.getByRole('group', {name:'アニメーション'});
    expect(within(design).getByRole('button', {name:'ウェブ'})).toBeTruthy();
    const publishedGames = screen.getAllByRole('button', {name:'ゲーム'}).find(button => !button.closest('[role="group"]'))!;
    await user.click(publishedGames);
    expect(location.hash).toBe('#works');
    expect(screen.getByRole('heading', {level:1, name:'ゲーム'})).toBeTruthy();
    await user.click(within(design).getByRole('button', {name:'ゲーム'}));
    expect(location.hash).toBe('#games');
    expect(screen.getByRole('heading', {level:1, name:'ゲームUI'})).toBeTruthy();
    expect(document.querySelectorAll('#gallery .style-card')).toHaveLength(12);
    for (const [name, hash] of [['モーション','#motion'], ['トランジション','#transitions']]) {
      await user.click(within(animation).getByRole('button', {name}));
      expect(location.hash).toBe(hash);
      expect(screen.getByRole('heading', {level:1, name})).toBeTruthy();
    }
  });
  it('starts desktop navigation closed and preserves its toggle state across page navigation', async () => {
    const user = userEvent.setup(); renderApp();
    expect(document.querySelector('#sidebar')?.hasAttribute('inert')).toBe(true);
    expect(screen.queryByRole('button', {name:'メニューを閉じる'})).toBeNull();
    await user.click(screen.getByRole('button', {name:'メニューを開く'}));
    const toggle = screen.getByRole('button', {name:'メニューを閉じる'});
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.closest('#sidebar')).toBeTruthy();
    expect(within(document.querySelector('.site-header')!).queryByRole('link', {name:'冷凍チョコ ギャラリー ホーム'})).toBeNull();
    expect(screen.queryByRole('button', {name:'メニューを開く'})).toBeNull();
    await user.click(toggle);
    const menu = screen.getByRole('button', {name:'メニューを開く'});
    expect(menu.closest('.site-header')).toBeTruthy();
    expect(within(document.querySelector('.site-header')!).getByRole('link', {name:'冷凍チョコ ギャラリー ホーム'}).getAttribute('href')).toBe('#home');
    expect(document.activeElement).toBe(menu);
    expect(screen.queryByRole('button', {name:'メニューを閉じる'})).toBeNull();
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector('#sidebar')?.hasAttribute('inert')).toBe(true);
    expect(document.querySelector('.workspace')?.classList.contains('sidebar-collapsed')).toBe(true);
    history.replaceState(null, '', '/#media');
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    await user.click(menu);
    expect(document.activeElement).toBe(screen.getByRole('button', {name:'メニューを閉じる'}));
    expect(within(document.querySelector('.site-header')!).queryByRole('link', {name:'冷凍チョコ ギャラリー ホーム'})).toBeNull();
    expect(document.querySelector('#sidebar')?.hasAttribute('inert')).toBe(false);
    await user.click(screen.getByRole('button', {name:'ウェブ'}));
    expect(screen.getByRole('button', {name:'メニューを閉じる'}).getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelector('.workspace')?.classList.contains('sidebar-collapsed')).toBe(false);
    expect(screen.queryByRole('button', {name:'メニューの外側を押して閉じる'})).toBeNull();
  });

  it('dismisses the mobile sidebar from the backdrop without activating content behind it', async () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({matches:query === '(max-width: 760px)',media:query,addEventListener:vi.fn(),removeEventListener:vi.fn()})));
    const user = userEvent.setup(); renderApp();
    let menu = screen.getByRole('button', {name:'メニューを開く'});
    await user.click(menu);
    const close = screen.getByRole('button', {name:'メニューを閉じる'});
    expect(close.closest('#sidebar')).toBeTruthy();
    expect(document.activeElement).toBe(close);
    expect(screen.queryByRole('button', {name:'メニューを開く'})).toBeNull();
    await user.click(screen.getByRole('button', {name:'メニューの外側を押して閉じる'}));
    menu = screen.getByRole('button', {name:'メニューを開く'});
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', {name:'メニューの外側を押して閉じる'})).toBeNull();
    expect(document.activeElement).toBe(menu);
    expect(location.hash).toBe('');
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(menu);
    await user.click(screen.getByRole('button', {name:'メディア'}));
    expect(location.hash).toBe('#media');
    menu = screen.getByRole('button', {name:'メニューを開く'});
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(menu);
    await user.click(menu);
    await user.click(screen.getByRole('button', {name:'メニューを閉じる'}));
    expect(document.activeElement).toBe(screen.getByRole('button', {name:'メニューを開く'}));
  });

  it('opens home by default and preserves direct catalog URLs and browser history', async () => {
    const user = userEvent.setup(); renderApp();
    expect(screen.getByRole('heading', {name:'ホーム', level:1})).toBeTruthy();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.getByRole('link', {name:'ウェブデザイン'}).getAttribute('href')).toBe('#styles');
    await user.click(screen.getByRole('button', {name:'メニューを開く'}));
    await user.click(screen.getByRole('button', {name:'ウェブ'}));
    expect(location.hash).toBe('#styles');
    expect(document.querySelectorAll('.style-card').length).toBe(16);
    history.replaceState(null, '', '/#home');
    fireEvent(window, new PopStateEvent('popstate'));
    expect(screen.getByRole('heading', {name:'ホーム', level:1})).toBeTruthy();
    history.replaceState(null, '', '/#motion');
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(document.querySelectorAll('.motion-card').length).toBe(13);
  });
  it('publishes the supplied game and channel links without mixing them with game UI samples', async () => {
    history.replaceState(null, '', '/#works');
    const user = userEvent.setup(); renderApp();
    const game = screen.getByRole('link', {name:'星屑のゆりかごをitch.ioで見る（新しいタブ）'});
    expect(game.getAttribute('href')).toBe('https://frozen-choco.itch.io/stardust-cradle');
    expect(game.getAttribute('rel')).toContain('noopener');
    expect(screen.queryByRole('searchbox')).toBeNull();
    await user.click(screen.getByRole('button', {name:'メニューを開く'}));
    await user.click(screen.getByRole('button', {name:'メディア'}));
    expect(screen.getByRole('link', {name:'冷凍チョコのYouTubeチャンネル（新しいタブ）'}).getAttribute('href')).toBe('https://www.youtube.com/channel/UCFH81ruwAfy-d2TzVRjsJFA');
    expect(screen.queryByText('ニコニコ')).toBeNull();
    expect(screen.getByRole('link', {name:'冷凍チョコ ギャラリー ホーム'}).getAttribute('href')).toBe('#home');
  });

  it('preserves search, filters, view, detail, prompt editing and focus restoration', async () => {
    history.replaceState(null, '', '/#styles');
    const user = userEvent.setup(); renderApp();
    expect(document.querySelectorAll('.style-card').length).toBe(16);
    await user.type(screen.getByRole('searchbox'), 'ミニマリズム');
    expect(document.querySelectorAll('.style-card').length).toBe(1);
    await user.click(screen.getByRole('button', {name:'リセット ↺'}));
    await user.click(screen.getByRole('button', {name:'楽しい・ポップ'}));
    expect(document.querySelectorAll('.style-card').length).toBeLessThan(16);
    await user.click(screen.getByRole('button', {name:'すべて'}));
    await user.click(screen.getByRole('button', {name:'リスト表示'}));
    expect(document.querySelector('#gallery')?.classList.contains('list-view')).toBe(true);
    const opener = screen.getByRole('button', {name:'Minimalism の見本と特徴を見る'});
    await user.click(opener);
    expect(trackDetail).toHaveBeenLastCalledWith('styles', 'minimal');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', {name:'ミニマリズム'})).toBeTruthy();
    await user.click(within(dialog).getByText('AIへの指示例'));
    const textarea = within(dialog).getByRole('textbox');
    await user.clear(textarea); await user.type(textarea, '確認用の指示');
    await user.click(within(dialog).getByRole('button', {name:'コピー'}));
    expect(await navigator.clipboard.readText()).toBe('確認用の指示');
    fireEvent(dialog, new Event('cancel', {cancelable:true}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
    await user.keyboard('/'); expect(document.activeElement).toBe(screen.getByRole('searchbox'));
  });
  it('keeps all game, motion and transition specimens and clickable animated previews', async () => {
    const user = userEvent.setup(); renderApp();
    await user.click(screen.getByRole('button', {name:'メニューを開く'}));
    for (const [label, count] of [['ゲームUI',12], ['モーション',13], ['トランジション',12]] as const) {
      await user.click(label === 'ゲームUI' ? within(screen.getByRole('group', {name:'デザイン'})).getByRole('button', {name:'ゲーム'}) : screen.getByRole('button', {name:label}));
      expect(document.querySelectorAll('.style-card').length).toBe(count);
      const preview = document.querySelector<HTMLButtonElement>('#gallery .preview-button, #gallery .motion-stage')!;
      await user.click(preview);
      expect(screen.getByRole('dialog')).toBeTruthy();
      if (label !== 'ゲームUI') expect(document.querySelector('#gallery [data-motion]')?.classList.contains('is-paused')).toBe(true);
      await user.click(screen.getByRole('button', {name:'閉じる'}));
    }
  });
  it('paginates 1,000 models, searches all pages, resets filtered pages and preserves downloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true, json:async () => fixtureModels(1000)}));
    history.replaceState(null, '', '/#models');
    const user = userEvent.setup(); renderApp();
    await screen.findByText('1–60 / 1000件');
    expect(document.querySelectorAll('.model-card').length).toBe(60);
    expect(fetch).toHaveBeenCalledTimes(1);
    const top = within(screen.getByRole('navigation', {name:'モデルのページ（上部）'}));
    await user.click(top.getByRole('button', {name:'次のページ'}));
    expect(screen.getByText('61–120 / 1000件')).toBeTruthy();
    await user.selectOptions(top.getByRole('combobox'), '17');
    expect(screen.getByText('961–1000 / 1000件')).toBeTruthy();
    expect(document.querySelectorAll('.model-card').length).toBe(40);
    expect((top.getByRole('button', {name:'次のページ'}) as HTMLButtonElement).disabled).toBe(true);
    await user.type(screen.getByRole('searchbox'), 'モデル 0999');
    expect(document.querySelectorAll('.model-card').length).toBe(1);
    expect(screen.getByRole('link', {name:'モデル 0999のGLBをダウンロード'}).getAttribute('href')).toContain('/model_0999.glb');
    const download = screen.getByRole('link', {name:'モデル 0999のGLBをダウンロード'});
    download.addEventListener('click', event => event.preventDefault());
    await user.click(download);
    expect(trackDownload).toHaveBeenLastCalledWith('model_0999', 'glb');
    await user.clear(screen.getByRole('searchbox'));
    await user.selectOptions(top.getByRole('combobox'), '17');
    await user.click(screen.getByRole('button', {name:'家具'}));
    expect(screen.getByText('1–60 / 500件')).toBeTruthy();
    await user.type(screen.getByRole('searchbox'), '該当しない');
    expect(screen.getByText('該当する見本がありません。')).toBeTruthy();
    await user.click(screen.getByRole('button', {name:'絞り込みを解除'}));
    expect(screen.getByText('1–60 / 1000件')).toBeTruthy();
  });
  it('handles first-wheel zoom once, switches photos, resets and disposes the viewer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok:true, json:async () => fixtureModels(1)}));
    history.replaceState(null, '', '/#models');
    const user = userEvent.setup(); renderApp();
    await user.click(await screen.findByRole('button', {name:'モデル 0001の詳細を見る'}));
    await screen.findByRole('button', {name:'視点をリセット'});
    const viewer = document.querySelector('model-viewer') as FakeViewer;
    const stage = document.querySelector('[data-model-stage]')!;
    fireEvent.wheel(stage, {deltaY:-30,deltaMode:0}); expect(viewer.zoom).toHaveBeenCalledExactlyOnceWith(1);
    await user.click(screen.getByRole('button', {name:'背面'}));
    expect(screen.getByRole('img', {name:'モデル 0001の背面'}).getAttribute('src')).toContain('/back.jpg');
    fireEvent.wheel(stage, {deltaY:-30}); expect(viewer.zoom).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', {name:'3D'}));
    await user.click(screen.getByRole('button', {name:'視点をリセット'}));
    expect(viewer.jumpCameraToGoal).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', {name:'閉じる'}));
    expect(document.querySelector('model-viewer')).toBeNull();
    fireEvent.wheel(stage, {deltaY:-30}); expect(viewer.zoom).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains('modal-open')).toBe(false);
  });
});
