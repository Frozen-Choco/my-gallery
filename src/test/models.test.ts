import {expect, it, vi} from 'vitest';
import {loadModelCatalog, normalizeModels} from '../catalog/models';

it('rejects unsafe paths, deduplicates entries and validates numeric metadata', () => {
  const data = normalizeModels([{id:'safe', category:'furniture', title_ja:'<script>text</script>', triangles:-1}, {id:'../unsafe',category:'furniture'}, {id:'safe',category:'furniture'}, {id:'second',category:'unknown', dimensions_m:[1,'2',3]}]);
  expect(data.items.map(m => m.id)).toEqual(['safe','second']);
  expect(data.items[0].triangles).toBeNull();
  expect(data.items[1].dimensions).toBeNull();
  expect(data.filters).toEqual(['すべて','家具','unknown']);
  expect(() => normalizeModels({})).toThrow();
  expect(() => normalizeModels([{id:'../bad', category:'street'}])).toThrow();
  expect(normalizeModels([]).items).toEqual([]);
});
it('uses the bundled snapshot when the remote catalog is unavailable', async () => {
  const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ok:true, json:async () => [{id:'chair', category:'furniture'}]} as Response);
  const result = await loadModelCatalog(fetcher);
  expect(result.fallback).toBe(true); expect(result.items[0].id).toBe('chair');
  expect(String(fetcher.mock.calls[1][0])).toMatch(/models-catalog.json$/);
});
it('reports failure when both catalog sources fail', async () => {
  await expect(loadModelCatalog(vi.fn<typeof fetch>().mockRejectedValue(new Error('offline')))).rejects.toThrow('offline');
});
