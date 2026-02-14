import { mapToMusicItem, type MusicItem, type ParseRecord, type Platform } from './mappings.js';

export type MultiPlatformRecords = Partial<Record<Platform, ParseRecord[]>>;

export function aggregateMusicItems(recordsByPlatform: MultiPlatformRecords): MusicItem[] {
  const platforms: Platform[] = ['netease', 'qq', 'kuwo'];

  return platforms.flatMap((platform) => {
    const records = recordsByPlatform[platform] ?? [];
    return records.map((record) => mapToMusicItem(platform, record));
  });
}
