export type Platform = 'netease' | 'qq' | 'kuwo';

export interface MusicItem {
  id: string;
  platform: Platform;
  title: string;
  artist: string;
  album?: string;
  durationSec?: number;
  coverUrl?: string;
  audioUrl?: string;
  lyricsAvailable?: boolean;
}

export interface GroupedMusicItem {
  key: string;
  canonical: MusicItem;
  variants: MusicItem[];
}
