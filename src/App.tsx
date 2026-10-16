import {Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {trackDetail, trackPage} from './analytics';
import {animatedPage, collectionAllRoutes, collectionFor, collectionPages, exampleCatalogs, matchItems, pageFromHash, titles} from './catalog';
import {loadModelCatalog} from './catalog/models';
import {Brand} from './components/Brand';
import {DetailDialog} from './components/DetailDialog';
import {Icon, type IconName} from './components/Icon';
import {ModelCard} from './components/ModelPreview';
import {PersonalPages} from './components/PersonalPages';
import {ExampleCard} from './components/ExampleCard';
import {CollectionOverview} from './components/CollectionOverview';
import type {ExampleItem, ExamplePage, Model, ModelCatalog, ModelStatus, Page, SitePage, Selection, SortOrder} from './types';

const pageSize = 60;
type NavigationItem = {page: SitePage; icon: IconName; divider?: boolean};
type SourcedItem = (ExampleItem | Model) & {sourcePage: Page};
const navigation: NavigationItem[] = [
  {page:'home', icon:'home', divider:true},
  {page:'works', icon:'game', divider:true},
  {page:'media', icon:'video'},
  {page:'design', icon:'grid', divider:true},
  {page:'animation', icon:'motion'},
  {page:'models', icon:'cube'},
];
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
  const [route, setPage] = useState<SitePage>(() => pageFromHash(location.hash));
  const personalPage = route === 'home' || route === 'works' || route === 'media' ? route : null;
  const collection = collectionFor(route);
  const overview = route === 'design' || route === 'animation' ? route : null;
  const combined = collection !== null && (route === collection || route === collectionAllRoutes[collection]);
  const page: Page = personalPage ? 'styles' : combined ? collectionPages[collection][0] : route as Page;
  const [filter, setFilter] = useState('すべて');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('name-asc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [modelPage, setModelPage] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const sidebarVisible = mobile ? sidebarOpen : desktopSidebarOpen;
  const sidebarControlFocus = useRef(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarCloseRef = useRef<HTMLButtonElement>(null);
  function changeSidebar(open: boolean) {
    sidebarControlFocus.current = true;
    if (mobile) setSidebarOpen(open); else setDesktopSidebarOpen(open);
  }
  useEffect(() => {
    if (sidebarControlFocus.current || (!sidebarVisible && document.getElementById('sidebar')?.contains(document.activeElement))) {
      (sidebarVisible ? sidebarCloseRef : menuRef).current?.focus({preventScroll: true});
    }
    sidebarControlFocus.current = false;
  }, [sidebarVisible]);
  const [message, setMessage] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paginationFocus = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const models = useModels(page === 'models' || route === 'home');
  useEffect(() => {trackPage(route, titles[route]); document.title = `${titles[route]} | 冷凍チョコ ギャラリー`;}, [route]);
  const reset = useCallback(() => {setFilter('すべて'); setQuery(''); setModelPage(1);}, []);
  const navigate = useCallback((next: SitePage) => {
    setPage(next); reset(); setSidebarOpen(false); setSelection(null);
    if (location.hash !== '#' + next) history.pushState(null, '', '#' + next);
    document.querySelector('.workspace')?.scrollIntoView({block: 'start'});
  }, [reset]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const resize = () => setMobile(media.matches);
    const hashchange = () => {if (location.hash === '' || Object.hasOwn(titles, location.hash.slice(1))) {setPage(pageFromHash(location.hash)); reset(); setSelection(null); setSidebarOpen(false);}};
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as Element | null;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !target?.closest('input,textarea,[contenteditable]') && !document.querySelector('dialog[open]')) {event.preventDefault(); searchRef.current?.focus();}
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    media.addEventListener('change', resize); window.addEventListener('hashchange', hashchange); window.addEventListener('popstate', hashchange);
    document.addEventListener('keydown', keydown);
    return () => {media.removeEventListener('change', resize); window.removeEventListener('hashchange', hashchange); window.removeEventListener('popstate', hashchange); document.removeEventListener('keydown', keydown);};
  }, [reset]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const toast = useCallback((text: string) => {
    setMessage(text); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setMessage(''), 2600);
  }, []);
  const catalog = useMemo(() => {
    if (page === 'models') return {items: models.catalog.items.map(item => ({...item, sourcePage:'models' as const})), filters:models.catalog.filters};
    const sources: ExamplePage[] = combined ? collectionPages[collection] : [page];
    return {
      items: sources.flatMap(sourcePage => exampleCatalogs[sourcePage].items.map(item => ({...item, sourcePage}))),
      filters: [...new Set(sources.flatMap(sourcePage => exampleCatalogs[sourcePage].filters))],
    };
  }, [combined, collection, page, models.catalog]);
  const matched = useMemo(() => matchItems<SourcedItem>(catalog.items, filter, query, sort), [catalog.items, filter, query, sort]);
  const pages = page === 'models' ? Math.max(1, Math.ceil(matched.length / pageSize)) : 1;
  const currentPage = Math.min(modelPage, pages), start = (currentPage - 1) * pageSize;
  const visible = page === 'models' ? matched.slice(start, start + pageSize) : matched;
  function changeModelPage(next: number) {paginationFocus.current = true; setModelPage(next);}
  useEffect(() => {
    if (!paginationFocus.current) return;
    paginationFocus.current = false; resultsRef.current?.scrollIntoView({block: 'start'});
    resultsRef.current?.querySelector<HTMLSelectElement>('[data-model-page]')?.focus({preventScroll: true});
  }, [currentPage]);
  function openDetail(item: SourcedItem) {
    const page = item.sourcePage;
    trackDetail(page, item.id);
    setSelection(page === 'models' ? {page, item: item as Model} : {page, item: item as ExampleItem});
  }
  const isAnimated = animatedPage(page);
  const empty = matched.length === 0 && !(page === 'models' && ['idle', 'loading', 'error'].includes(models.status));
  const status = page === 'models' ? models.status : '';
  function navigationButton(item: NavigationItem) {
    return <button key={item.page} className={`nav-item${(collection ?? route) === item.page ? ' active' : ''}`} data-page={item.page} aria-current={(collection ?? route) === item.page ? 'page' : undefined} onClick={() => navigate(item.page)}><span><Icon name={item.icon}/></span><span>{titles[item.page]}</span></button>;
  }
  return <>
    <a href="#main" className="skip">コンテンツへ移動</a>
    {mobile && sidebarOpen && <button type="button" className="sidebar-backdrop" aria-label="メニューの外側を押して閉じる" onClick={() => changeSidebar(false)}/>}
    <aside className={`sidebar${sidebarVisible ? ' open' : ''}`} id="sidebar" inert={!sidebarVisible} aria-hidden={!sidebarVisible}>
      {sidebarVisible && <button ref={sidebarCloseRef} type="button" className="icon-button sidebar-close" title="メニューを閉じる" aria-label="メニューを閉じる" aria-expanded={true} aria-controls="sidebar" onClick={() => changeSidebar(false)}><Icon name="collapse"/></button>}
      <div className="sidebar-content">
      <Brand/>
      <nav aria-label="メインナビゲーション">{navigation.map(entry => <Fragment key={entry.page}>
        {entry.divider && <hr className="sidebar-divider" aria-hidden="true"/>}
        {navigationButton(entry)}
      </Fragment>)}</nav>
      <a className="privacy-link" href="./privacy.html">プライバシー</a>
      </div>
    </aside>
    <div className={`workspace${!mobile && !desktopSidebarOpen ? ' sidebar-collapsed' : ''}`}><header className={`site-header${!sidebarVisible ? ' menu-visible' : ''}`}>
      <div className="catalog-heading"><div className="section-title">{!sidebarVisible && <button ref={menuRef} id="menu-button" className="icon-button menu-open" title="メニューを開く" aria-label="メニューを開く" aria-expanded={false} aria-controls="sidebar" onClick={() => changeSidebar(true)}><Icon name="menu"/></button>}<h1 id="catalog-title">{titles[route]}</h1></div>
      </div>
      <div className="header-brand-viewport" aria-hidden={!mobile && sidebarVisible} inert={!mobile && sidebarVisible}><Brand header/></div>
      </header><main id="main"><section className="catalog" aria-labelledby="catalog-title">
      {personalPage ? <PersonalPages page={personalPage} models={models.catalog.items}/> : overview ? <CollectionOverview key={overview} collection={overview} onNavigate={navigate} paused={selection !== null} onOpen={({page:sourcePage, item}) => openDetail({...item, sourcePage})}/> : <>
      {collection && <a className="collection-back" href={`#${collection}`} onClick={event => {if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {event.preventDefault(); navigate(collection);}}}>← {titles[collection]}</a>}
      <div className="catalog-toolbar">
      <div className="catalog-search"><label className="search-box"><Icon name="search"/><input ref={searchRef} id="search" type="search" placeholder={page === 'models' ? 'モデル名・カテゴリで検索' : isAnimated ? '効果・特徴で検索' : 'スタイル・特徴で検索'} autoComplete="off" aria-label={`${titles[collection ?? page]}・キーワードを検索`} value={query} onChange={event => {setQuery(event.target.value); setModelPage(1);}}/><kbd>/</kbd></label></div>
      </div>
      <div className="filter-row"><div id="filters" className="filters" aria-label={page === 'models' ? 'カテゴリで絞り込む' : isAnimated ? '効果で絞り込む' : page === 'games' ? '見た目で絞り込む' : '印象で絞り込む'}>
        {catalog.filters.map(value => <button key={value} className={`filter-chip${filter === value ? ' active' : ''}`} aria-pressed={filter === value} data-filter={value} onClick={() => {setFilter(value); setModelPage(1);}}>{value}</button>)}
      </div><button id="filter-reset" className={`text-button${!query.trim() && filter === 'すべて' ? ' hidden' : ''}`} onClick={reset}>リセット ↺</button></div>
      <p id="catalog-status" className={`catalog-status${['loading','fallback','error'].includes(status) ? '' : ' hidden'}`} role="status">
        {status === 'loading' ? 'モデルを読み込んでいます…' : status === 'fallback' ? '最新の一覧を取得できないため、保存済みの一覧を表示しています。' : status === 'error' ? 'モデルを読み込めませんでした。' : ''}
        {(status === 'fallback' || status === 'error') && <button onClick={models.retry}>再読み込み</button>}
      </p>
      <div className="results-bar" ref={resultsRef}><p id="result-count" aria-live="polite">{page === 'models' && pages > 1 ? `${start + 1}–${Math.min(start + pageSize, matched.length)} / ${matched.length}件` : `${matched.length}件`}</p>
        <div className="results-actions"><Pagination page={currentPage} pages={pages} top onChange={changeModelPage}/><label className="sort-label"><span className="sr-only">並び順</span><select id="sort" value={sort} onChange={event => {setSort(event.target.value as SortOrder); setModelPage(1);}}><option value="name-asc">名前の昇順</option><option value="name-desc">名前の降順</option></select></label>
          <div className="view-switch" aria-label="表示形式">{(['grid','list'] as const).map(value => <button key={value} className={`icon-button${view === value ? ' selected' : ''}`} data-view={value} aria-label={value === 'grid' ? 'グリッド表示' : 'リスト表示'} aria-pressed={view === value} onClick={() => setView(value)}><Icon name={value}/></button>)}</div>
        </div>
      </div>
      <div id="gallery" className={`gallery${page === 'models' ? ' models-gallery' : ''}${view === 'list' ? ' list-view' : ''}`}>
        {visible.map(item => {
          const itemPage = item.sourcePage;
          if (itemPage === 'models') return <ModelCard key={`models:${item.id}`} model={item as Model} onOpen={() => openDetail(item)}/>;
          return <ExampleCard key={`${itemPage}:${item.id}`} page={itemPage} item={item as ExampleItem} paused={selection !== null} onOpen={() => openDetail(item)}/>;
        })}
      </div>
      <Pagination page={currentPage} pages={pages} onChange={changeModelPage}/>
      <div id="empty" className={`empty${empty ? '' : ' hidden'}`}><p id="empty-message">該当する見本がありません。</p><button id="empty-reset" className="primary-button" onClick={reset}>絞り込みを解除</button></div>
    </>}
    </section></main></div>
    {selection && <DetailDialog key={`${selection.page}:${selection.item.id}`} selection={selection} onClose={() => setSelection(null)} onToast={toast}/>}
    <div id="toast" className={`toast${message ? ' show' : ''}`} role="status">{message}</div>
  </>;
}
