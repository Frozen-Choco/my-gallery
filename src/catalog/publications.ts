import saved from '../../public/videos.json';

export const youtube = {name:'冷凍チョコ', id:'UCFH81ruwAfy-d2TzVRjsJFA', url:'https://www.youtube.com/channel/UCFH81ruwAfy-d2TzVRjsJFA'};
export interface Publication {id: string; title: string; url: string; kind: 'video' | 'game'; thumbnail?: string; publishedAt?: string}
export interface Video extends Publication {kind: 'video'; thumbnail: string; publishedAt: string}
// Games are listed newest first. Add a publication date when it is known.
export const publishedGames: Publication[] = [
  {id:'tomori-labyrinth', title:'灯守と常夜の迷宮', url:'https://tomori-labyrinth.pages.dev/', kind:'game'},
  {id:'stardust-cradle', title:'星屑のゆりかご', url:'https://stardust-cradle-game.pages.dev/', kind:'game'},
];

export function normalizeVideos(data: unknown): Video[] {
  if (!data || typeof data !== 'object' || !('videos' in data) || !Array.isArray(data.videos)) throw new Error('Invalid video catalog');
  const seen = new Set<string>();
  return data.videos.flatMap((item: unknown): Video[] => {
    if (!item || typeof item !== 'object' || !('id' in item) || !('title' in item) || !('publishedAt' in item)) return [];
    const {id, title, publishedAt} = item;
    if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id) || seen.has(id) || typeof title !== 'string' || !title.trim() || typeof publishedAt !== 'string' || !Number.isFinite(Date.parse(publishedAt))) return [];
    seen.add(id);
    return [{id, title, publishedAt, kind:'video', url:`https://www.youtube.com/watch?v=${id}`, thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}];
  }).sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}
export const savedVideos = normalizeVideos(saved);
export function featuredPublications(videos: Video[], games = publishedGames): Publication[] {
  return [...[...videos].sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0,3), ...games.slice(0,2)];
}
export async function loadVideos(): Promise<Video[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    // Read the latest data directly: GITHUB_TOKEN commits do not trigger a Pages build.
    const response = await fetch('https://raw.githubusercontent.com/Frozen-Choco/my-gallery/main/public/videos.json', {signal:controller.signal, cache:'no-cache'});
    if (!response.ok) throw new Error('Video catalog unavailable');
    return normalizeVideos(await response.json());
  } catch {return savedVideos;} finally {clearTimeout(timeout);}
}
