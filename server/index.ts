import { mapToMusicItem, MusicItem, ParseRecord, Platform, PlatformParseRecord } from './mappings';

export type PlatformParseResults = Partial<Record<Platform, ParseRecord[]>>;

export function aggregateMusicItems(resultsByPlatform: PlatformParseResults): MusicItem[] {
  const platformRecords: PlatformParseRecord[] = [];

  for (const platform of Object.keys(resultsByPlatform) as Platform[]) {
    const records = resultsByPlatform[platform] ?? [];

    for (const rec of records) {
      platformRecords.push({ platform, rec });
    }
  }

  return platformRecords.map(({ platform, rec }) => mapToMusicItem(platform, rec));
}
