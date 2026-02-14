import type { MusicItem, Platform } from '../types';

export async function searchMusic(keyword: string, platforms: Platform[]): Promise<MusicItem[]> {
  const query = new URLSearchParams({ keyword, platforms: platforms.join(',') });
  const res = await fetch(`/api/tune/search?${query.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  const data = (await res.json()) as { items: MusicItem[] };
  return data.items;
}
