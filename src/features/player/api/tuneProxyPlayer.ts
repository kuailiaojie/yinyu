import type { Platform } from '../../search/types';

export type SongResponse = {
  id: string;
  title: string;
  artist: string;
  url?: string;
};

export type LyricsResponse = {
  id: string;
  lyrics: string;
};

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchSong(platform: Platform, id: string): Promise<SongResponse> {
  return postJson<SongResponse>('/api/tune/song', { platform, id });
}

export function fetchLyrics(platform: Platform, id: string): Promise<LyricsResponse> {
  return postJson<LyricsResponse>('/api/tune/lyrics', { platform, id });
}
