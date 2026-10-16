export type Page = 'styles' | 'games' | 'motion' | 'transitions' | 'models';
export type PersonalPage = 'home' | 'works' | 'media';
export type CollectionPage = 'design' | 'animation';
export type SitePage = Page | PersonalPage | CollectionPage;
export type ExamplePage = Exclude<Page, 'models'>;
export interface CatalogItem {
  id: string;
  name: string;
  ja: string;
  category: string[];
  tags: string[];
  description: string;
  use: string;
}
export interface ExampleItem extends CatalogItem { traits: string[]; avoid: string }
export interface GameStyle extends ExampleItem { colors: string[] }
export interface DesignStyle extends GameStyle { layout: string; type: string }
export interface MotionStyle extends ExampleItem { duration: number }
export interface Model extends CatalogItem {
  triangles: number | null;
  vertices: number | null;
  dimensions: number[] | null;
  glbBytes: number | null;
  blendBytes: number | null;
  blender: string;
  preview: string;
  back: string;
  glb: string;
  blend: string;
}
export interface ModelCatalog { items: Model[]; filters: string[] }
export type ModelStatus = 'idle' | 'loading' | 'loaded' | 'fallback' | 'error';
export type Selection = {page: ExamplePage; item: ExampleItem} | {page: 'models'; item: Model};
