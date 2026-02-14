import type { Platform } from '../src/features/search/types';
import type { MusicItem } from '../src/features/search/types';

export type ParseRecord = {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration?: number;
  pic?: string;
  url?: string;
  lyric?: string;
};

export const mappingTable = {
  fromApiMd: {
    endpoint: 'POST /v1/parse',
    request: ['platform', 'ids', 'quality'],
    responseAssumed: ['id', 'name', 'artist', 'album', 'duration', 'pic', 'url', 'lyric']
  },
  toMusicItem: {
    id: 'id',
    platform: 'request.platform',
    title: 'name',
    artist: 'artist',
    album: 'album',
    durationSec: 'duration / 1000',
    coverUrl: 'pic',
    audioUrl: 'url',
    lyricsAvailable: 'Boolean(lyric)'
  }
};

export function mapToMusicItem(platform: Platform, rec: ParseRecord): MusicItem {
  return {
    id: rec.id,
    platform,
    title: rec.name,
    artist: rec.artist,
    album: rec.album,
    durationSec: rec.duration ? Math.round(rec.duration / 1000) : undefined,
    coverUrl: rec.pic,
    audioUrl: rec.url,
    lyricsAvailable: Boolean(rec.lyric)
  };
}
