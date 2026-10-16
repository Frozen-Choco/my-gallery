import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {trackDetail, trackPage} from './analytics';
import {animatedPage, exampleCatalogs, matchItems, pageFromHash, titles} from './catalog';
import {loadModelCatalog} from './catalog/models';
import {DetailDialog} from './components/DetailDialog';
import {Icon, type IconName} from './components/Icon';
import {ModelCard} from './components/ModelPreview';
import {Specimen} from './components/Specimen';
import type {ExampleItem, Model, ModelCatalog, ModelStatus, Page, Selection} from './types';

const pageSize = 60;
const navigation: {page: Page; icon: IconName}[] = [{page:'styles',icon:'grid'}, {page:'games',icon:'game'}, {page:'motion',icon:'motion'}, {page:'transitions',icon:'layers'}, {page:'models',icon:'cube'}];
function useModels(active: boolean) {
  const [catalog, setCatalog] = useState<ModelCatalog>({items: [], filters: ['すべて']});
  const [status, setStatus] = useState<ModelStatus>('idle');
  const [retry, setRetry] = useState(0);
  const request = useRef<ReturnType<typeof loadModelCatalog> | null>(null);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    if (!request.current) setStatus('loading');
    const pending = request.current ??= loadModelCatalog();
    void pending.then(result => {
      if (!cancelled) {setCatalog(result); setStatus(result.fallback ? 'fallback' : 'loaded');}
    }).catch(() => {if (!cancelled) setStatus('error');});
    return () => {cancelled = true;};
  }, [active, retry]);
  return {catalog, status, retry: () => {request.current = null; setRetry(n => n + 1);}};
}
function Pagination({page, pages, top = false, onChange}: {page: number; pages: number; top?: boolean; onChange: (page: number) => void}) {
  return <nav className={`model-pagination${top ? ' model-pagination-top' : ''}${pages <= 1 ? ' hidden' : ''}`} data-model-pagination aria-label={`モデルのページ（${top ? '上部' : '下部'}）`}>
    {pages > 1 && <><button aria-label="前のページ" disabled={page === 1} onClick={() => onChange(page - 1)}>←</button>
      <select data-model-page aria-label="ページを選択" value={page} onChange={event => onChange(Number(event.target.value))}>
        {Array.from({length: pages}, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} / {pages}</option>)}
      </select><button aria-label="次のページ" disabled={page === pages} onClick={() => onChange(page + 1)}>→</button></>}
  </nav>;
}
export function App() {
  const [page, setPage] = useState<Page>(() => pageFromHash(location.hash));
  const [filter, setFilter] = useState('すべて');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'default' | 'name'>('default');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [modelPage, setModelPage] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const [message, setMessage] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paginationFocus = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const models = useModels(page === 'models');
  useEffect(() => {trackPage(page, titles[page]);}, [page]);
  const reset = useCallback(() => {setFilter('すべて'); setQuery(''); setModelPage(1);}, []);
  const navigate = useCallback((next: Page) => {
    setPage(next); reset(); setSidebarOpen(false); setSelection(null);
    history.replaceState(null, '', next === 'styles' ? location.pathname : '#' + next);
  }, [reset]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const resize = () => setMobile(media.matches);
    const hashchange = () => {if (location.hash === '' || Object.hasOwn(titles, location.hash.slice(1))) {setPage(pageFromHash(location.hash)); reset(); setSelection(null);}};
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !target?.closest('input,textarea,[contenteditable]') && !document.querySelector('dialog[open]')) {event.preventDefault(); searchRef.current?.focus();}
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    const outside = (event: MouseEvent) => {if (!(event.target as Element).closest('#sidebar,#menu-button')) setSidebarOpen(false);};
    media.addEventListener('change', resize); window.addEventListener('hashchange', hashchange);
    document.addEventListener('keydown', keydown); document.addEventListener('click', outside);
    return () => {media.removeEventListener('change', resize); window.removeEventListener('hashchange', hashchange); document.removeEventListener('keydown', keydown); document.removeEventListener('click', outside);};
  }, [reset]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const toast = useCallback((text: string) => {
    setMessage(text); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setMessage(''), 2600);
  }, []);
  const catalog = page === 'models' ? models.catalog : exampleCatalogs[page];
  const matched = useMemo(() => matchItems<ExampleItem | Model>(catalog.items, filter, query, sort), [catalog.items, filter, query, sort]);
  const pages = page === 'models' ? Math.max(1, Math.ceil(matched.length / pageSize)) : 1;
  const currentPage = Math.min(modelPage, pages), start = (currentPage - 1) * pageSize;
  const visible = page === 'models' ? matched.slice(start, start + pageSize) : matched;
  function changeModelPage(next: number) {paginationFocus.current = true; setModelPage(next);}
  useEffect(() => {
    if (!paginationFocus.current) return;
    paginationFocus.current = false; resultsRef.current?.scrollIntoView({block: 'start'});
    resultsRef.current?.querySelector<HTMLSelectElement>('[data-model-page]')?.focus({preventScroll: true});
  }, [currentPage]);
  function openDetail(item: ExampleItem | Model) {
    trackDetail(page, item.id);
    setSelection(page === 'models' ? {page, item: item as Model} : {page, item: item as ExampleItem});
  }
  const isAnimated = animatedPage(page);
  const empty = matched.length === 0 && !(page === 'models' && ['idle', 'loading', 'error'].includes(models.status));
  const status = page === 'models' ? models.status : '';
  return <>
    <a href="#main" className="skip">コンテンツへ移動</a>
    <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar" inert={mobile && !sidebarOpen}>
      <a className="brand" href="./" aria-label="冷凍チョコ ギャラリー ホーム"><span className="brand-mark" aria-hidden="true">✳</span><span className="brand-name"><span>冷凍チョコ</span><span>ギャラリー</span></span></a>
      <nav aria-label="ライブラリ">{navigation.map(nav => <button key={nav.page} className={`nav-item${page === nav.page ? ' active' : ''}`} data-page={nav.page} aria-current={page === nav.page ? 'page' : undefined} onClick={() => navigate(nav.page)}><span><Icon name={nav.icon}/></span><span>{titles[nav.page]}</span></button>)}</nav>
      <a className="privacy-link" href="./privacy.html">プライバシー</a>
    </aside>
    <div className="workspace"><main id="main"><section className="catalog" aria-labelledby="catalog-title">
      <div className="catalog-heading"><div className="section-title"><button id="menu-button" className="icon-button mobile-only" aria-label="メニューを開く" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(open => !open)}><Icon name="menu"/></button><h1 id="catalog-title">{titles[page]}</h1></div>
        <label className="search-box"><Icon name="search"/><input ref={searchRef} id="search" type="search" placeholder={page === 'models' ? 'モデル名・カテゴリで検索' : isAnimated ? '効果・特徴で検索' : 'スタイル・特徴で検索'} autoComplete="off" aria-label={`${titles[page]}・キーワードを検索`} value={query} onChange={event => {setQuery(event.target.value); setModelPage(1);}}/><kbd>/</kbd></label>
      </div>
      <div className="filter-row"><div id="filters" className="filters" aria-label={page === 'models' ? 'カテゴリで絞り込む' : isAnimated ? '効果で絞り込む' : page === 'games' ? '見た目で絞り込む' : '印象で絞り込む'}>
        {catalog.filters.map(value => <button key={value} className={`filter-chip${filter === value ? ' active' : ''}`} aria-pressed={filter === value} data-filter={value} onClick={() => {setFilter(value); setModelPage(1);}}>{value}</button>)}
      </div><button id="filter-reset" className={`text-button${!query.trim() && filter === 'すべて' ? ' hidden' : ''}`} onClick={reset}>リセット ↺</button></div>
      <p id="catalog-status" className={`catalog-status${['loading','fallback','error'].includes(status) ? '' : ' hidden'}`} role="status">
        {status === 'loading' ? 'モデルを読み込んでいます…' : status === 'fallback' ? '最新の一覧を取得できないため、保存済みの一覧を表示しています。' : status === 'error' ? 'モデルを読み込めませんでした。' : ''}
        {(status === 'fallback' || status === 'error') && <button onClick={models.retry}>再読み込み</button>}
      </p>
      <div className="results-bar" ref={resultsRef}><p id="result-count" aria-live="polite">{page === 'models' && pages > 1 ? `${start + 1}–${Math.min(start + pageSize, matched.length)} / ${matched.length}件` : `${matched.length}件`}</p>
        <div className="results-actions"><Pagination page={currentPage} pages={pages} top onChange={changeModelPage}/><label className="sort-label"><span className="sr-only">並び順</span><select id="sort" value={sort} onChange={event => {setSort(event.target.value as 'default' | 'name'); setModelPage(1);}}><option value="default">標準順</option><option value="name">名前順</option></select></label>
          <div className="view-switch" aria-label="表示形式">{(['grid','list'] as const).map(value => <button key={value} className={`icon-button${view === value ? ' selected' : ''}`} data-view={value} aria-label={value === 'grid' ? 'グリッド表示' : 'リスト表示'} aria-pressed={view === value} onClick={() => setView(value)}><Icon name={value}/></button>)}</div>
        </div>
      </div>
      <div id="gallery" className={`gallery${page === 'models' ? ' models-gallery' : ''}${view === 'list' ? ' list-view' : ''}`}>
        {visible.map(item => page === 'models' ? <ModelCard key={item.id} model={item as Model} onOpen={() => openDetail(item)}/> : <article key={item.id} className={`style-card${isAnimated ? ' motion-card' : ''}`} data-id={item.id}>
          {isAnimated ? <Specimen page={page} item={item} paused={selection !== null} onOpen={() => openDetail(item)}/> : <button className="preview-button" data-detail={item.id} aria-label={`${item.name} の見本と特徴を見る`} onClick={() => openDetail(item)}><Specimen page={page} item={item}/></button>}
          <div className="card-info"><button className="card-title" onClick={() => openDetail(item)}><h2>{item.ja}</h2></button><p className="card-description">{item.description}</p></div>
        </article>)}
      </div>
      <Pagination page={currentPage} pages={pages} onChange={changeModelPage}/>
      <div id="empty" className={`empty${empty ? '' : ' hidden'}`}><p id="empty-message">該当する見本がありません。</p><button id="empty-reset" className="primary-button" onClick={reset}>絞り込みを解除</button></div>
    </section></main></div>
    {selection && <DetailDialog key={`${selection.page}:${selection.item.id}`} selection={selection} onClose={() => setSelection(null)} onToast={toast}/>}
    <div id="toast" className={`toast${message ? ' show' : ''}`} role="status">{message}</div>
  </>;
}
