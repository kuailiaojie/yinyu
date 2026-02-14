import Fuse from 'fuse.js';
import type { GroupedMusicItem, MusicItem } from '../types';

export function normalizeText(v: string): string {
  return v
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizedKey(item: MusicItem): string {
  return `${normalizeText(item.title)}::${normalizeText(item.artist)}`;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

export function dedupeMusic(items: MusicItem[]): GroupedMusicItem[] {
  const groups = new Map<string, MusicItem[]>();
  for (const item of items) {
    const key = normalizedKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const keys = [...groups.keys()];
  const fuse = new Fuse(keys, { threshold: 0.2 });
  for (const key of keys) {
    for (const alt of fuse.search(key).map((r) => r.item)) {
      if (key === alt || !groups.has(key) || !groups.has(alt)) continue;
      const [a, b] = [groups.get(key) ?? [], groups.get(alt) ?? []];
      const dist = levenshtein(key, alt);
      const durationNear = a.some((x) => b.some((y) => Math.abs((x.durationSec ?? 0) - (y.durationSec ?? 999)) < 3));
      if (dist <= 3 && durationNear) {
        groups.set(key, [...a, ...b]);
        groups.delete(alt);
      }
    }
  }

  return [...groups.entries()].map(([key, variants]) => ({
    key,
    variants,
    canonical: variants.sort((a, b) => Number(Boolean(b.lyricsAvailable && b.audioUrl)) - Number(Boolean(a.lyricsAvailable && a.audioUrl)))[0]
  }));
}
