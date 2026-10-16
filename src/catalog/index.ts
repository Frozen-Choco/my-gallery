import {styles, filters, promptFor} from './data';
import {sampleMarkup} from './samples';
import {games, gameFilters, gameMarkup, gamePrompt} from './games';
import {motions, motionFilters, motionMarkup, motionPrompt} from './motion';
import {transitions, transitionFilters, transitionMarkup, transitionPrompt} from './transitions';
import type {CatalogItem, CollectionListPage, CollectionPage, DesignStyle, ExampleItem, ExamplePage, GameStyle, MotionStyle, Page, SitePage} from '../types';

export const titles: Record<SitePage, string> = {'design-all':'デザイン一覧', 'animation-all':'アニメーション一覧', design:'デザイン', animation:'アニメーション', home:'ホーム', works:'ゲーム', media:'メディア', styles:'ウェブデザイン', games:'ゲームUI', motion:'モーション', transitions:'トランジション', models:'ローポリモデル'};
export const exampleCatalogs: Record<ExamplePage, {items: ExampleItem[]; filters: string[]}> = {
  styles: {items: styles, filters}, games: {items: games, filters: gameFilters},
  motion: {items: motions, filters: motionFilters}, transitions: {items: transitions, filters: transitionFilters},
};
export const collectionPages: Record<CollectionPage, ExamplePage[]> = {design:['styles', 'games'], animation:['motion', 'transitions']};
export const collectionAllRoutes: Record<CollectionPage, CollectionListPage> = {design:'design-all', animation:'animation-all'};
export const collectionLabels: Record<ExamplePage, string> = {styles:'ウェブ', games:'ゲーム', motion:'モーション', transitions:'トランジション'};
export function collectionFor(page: SitePage): CollectionPage | null {
  if (page === 'design-all' || page === 'design' || page === 'styles' || page === 'games') return 'design';
  if (page === 'animation-all' || page === 'animation' || page === 'motion' || page === 'transitions') return 'animation';
  return null;
}
export function pageFromHash(hash: string): SitePage {
  const candidate = hash.slice(1);
  return Object.hasOwn(titles, candidate) ? candidate as SitePage : 'home';
}
export const animatedPage = (page: Page) => page === 'motion' || page === 'transitions';
export function specimenMarkup(page: ExamplePage, item: CatalogItem, detail = false): string {
  if (page === 'motion') return motionMarkup(item, detail);
  if (page === 'transitions') return transitionMarkup(item, detail);
  return `<div class="sample ${page === 'games' ? 'game-sample' : ''} ${item.id}" aria-hidden="true">${page === 'games' ? gameMarkup(item) : sampleMarkup(item)}</div>`;
}
export function promptForItem(page: ExamplePage, item: ExampleItem): string {
  if (page === 'styles') return promptFor(item as DesignStyle);
  if (page === 'games') return gamePrompt(item as GameStyle);
  if (page === 'motion') return motionPrompt(item as MotionStyle);
  return transitionPrompt(item);
}
export function matchItems<T extends CatalogItem>(items: T[], filter: string, query: string, sort: 'default' | 'name'): T[] {
  const needle = query.trim().toLocaleLowerCase();
  const matched = items.filter(s => (filter === 'すべて' || s.category.includes(filter)) && `${s.name} ${s.ja} ${s.tags.join(' ')} ${s.category.join(' ')} ${s.description} ${s.use}`.toLocaleLowerCase().includes(needle));
  if (sort === 'name') matched.sort((a, b) => a.ja.localeCompare(b.ja, 'ja'));
  return matched;
}
