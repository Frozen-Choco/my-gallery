import type {Model, ModelCatalog} from '../types';

export const modelRepository = 'https://github.com/Frozen-Choco/low-poly-models';
const source = 'https://raw.githubusercontent.com/Frozen-Choco/low-poly-models/main/';
const categoryNames: Record<string, string> = {furniture: '家具', household: '生活小物', street: '街の設備', food: '食べ物'};
const number = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const safeSegment = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9_-]{1,100}$/i.test(value);
export const formatCount = (value: number | null) => value === null ? '—' : value.toLocaleString('ja-JP');
export const formatSize = (value: number | null) => value === null ? '' : value >= 1000000 ? `${(value / 1000000).toFixed(1)} MB` : `${(value / 1000).toFixed(1)} KB`;

export function normalizeModels(data: unknown): ModelCatalog {
  if (!Array.isArray(data)) throw new Error('Invalid catalog');
  const seen = new Set<string>();
  const items: Model[] = [];
  for (const model of data as unknown[]) {
    if (!record(model) || !safeSegment(model.id) || !safeSegment(model.category) || seen.has(model.id)) continue;
    seen.add(model.id);
    const category = categoryNames[model.category] || model.category;
    const base = `${source}assets/${model.category}/${model.id}/`;
    const dimensions = Array.isArray(model.dimensions_m) && model.dimensions_m.length === 3 && model.dimensions_m.every(n => number(n) !== null) ? model.dimensions_m as number[] : null;
    items.push({
      id: model.id, name: model.id, ja: typeof model.title_ja === 'string' ? model.title_ja : model.id,
      category: [category], tags: [model.category, 'ローポリ', 'GLB', 'Blender'], description: '', use: '',
      triangles: number(model.triangles), vertices: number(model.vertices), dimensions,
      glbBytes: number(model.glb_bytes), blendBytes: number(model.blend_bytes),
      blender: typeof model.blender_version === 'string' ? model.blender_version : '',
      preview: base + 'preview.jpg', back: base + 'back.jpg', glb: base + model.id + '.glb', blend: base + model.id + '.blend',
    });
  }
  if (data.length && !items.length) throw new Error('No valid models');
  return {items, filters: ['すべて', ...new Set(items.flatMap(m => m.category))]};
}
async function readCatalog(fetcher: typeof fetch, url: string): Promise<ModelCatalog> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(url, {signal: controller.signal, cache: 'no-cache'});
    if (!response.ok) throw new Error('Catalog unavailable');
    return normalizeModels(await response.json());
  } finally { clearTimeout(timer); }
}
export async function loadModelCatalog(fetcher: typeof fetch = fetch): Promise<ModelCatalog & {fallback: boolean}> {
  try { return {...await readCatalog(fetcher, source + 'catalog.json'), fallback: false}; }
  catch { return {...await readCatalog(fetcher, `${import.meta.env.BASE_URL}models-catalog.json`), fallback: true}; }
}
