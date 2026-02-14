export type Platform = 'netease' | 'qq' | 'kuwo';

export interface ParseRecord {
  id: string;
  title: string;
  artist: string;
  album?: string;
  url?: string;
}

export interface PlatformParseRecord {
  platform: Platform;
  rec: ParseRecord;
}

export interface MusicItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  url?: string;
  platform: Platform;
}

export function mapToMusicItem(platform: Platform, rec: ParseRecord): MusicItem {
  return {
    id: rec.id,
    title: rec.title,
    artist: rec.artist,
    album: rec.album,
    url: rec.url,
    platform,
  };
}
