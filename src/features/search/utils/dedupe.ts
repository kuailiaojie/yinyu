import type { GroupedMusicItem, MusicItem } from '../types';

export type SearchTrack = {
  id?: string;
  title: string;
  durationSeconds?: number;
};

const TRADITIONAL_TO_SIMPLIFIED_MAP: Record<string, string> = {
  後: '后',
  來: '来',
  臺: '台',
  風: '风',
  愛: '爱',
  樂: '乐',
  國: '国',
  說: '说',
  開: '开',
  門: '门',
  車: '车',
  這: '这',
  個: '个',
  麼: '么',
  為: '为',
  與: '与',
  時: '时',
  間: '间',
  夢: '梦',
  聽: '听',
  見: '见',
};

function toSimplifiedChinese(input: string): string {
  return Array.from(input)
    .map((char) => TRADITIONAL_TO_SIMPLIFIED_MAP[char] ?? char)
    .join('');
}

export function normalizeText(text: string): string {
  const simplified = toSimplifiedChinese(text.normalize('NFKC'));

  return simplified
    .toLowerCase()
    .replace(/\s*[\(\[（【][^\)\]）】]*[\)\]）】]\s*$/g, '')
    .replace(/[^\p{L}\p{N}\u4e00-\u9fff]+/gu, '')
    .trim();
}

function isDurationClose(a?: number, b?: number, toleranceSeconds = 2): boolean {
  if (a == null || b == null) return true;
  return Math.abs(a - b) <= toleranceSeconds;
}

export function isSameTrack(a: SearchTrack, b: SearchTrack): boolean {
  return normalizeText(a.title) === normalizeText(b.title) && isDurationClose(a.durationSeconds, b.durationSeconds);
}

export function dedupeTracks(tracks: SearchTrack[]): SearchTrack[] {
  const result: SearchTrack[] = [];

  for (const track of tracks) {
    const duplicated = result.some((existing) => isSameTrack(existing, track));
    if (!duplicated) {
      result.push(track);
    }
  }

  return result;
}

function toSearchTrack(item: MusicItem): SearchTrack {
  return {
    id: item.id,
    title: `${item.title} ${item.artist}`,
    durationSeconds: item.durationSec,
  };
}

export function dedupeMusic(items: MusicItem[]): GroupedMusicItem[] {
  const groups: GroupedMusicItem[] = [];

  for (const item of items) {
    const candidate = toSearchTrack(item);
    const existing = groups.find((group) => isSameTrack(toSearchTrack(group.canonical), candidate));

    if (existing) {
      existing.variants.push(item);
      continue;
    }

    groups.push({
      key: `${normalizeText(item.title)}-${normalizeText(item.artist)}`,
      canonical: item,
      variants: [item],
    });
  }

  return groups;
}
