import { describe, expect, test } from 'vitest';
import { dedupeMusic } from '../src/features/search/utils/dedupe';

const base = {
  artist: 'Jay Chou',
  platform: 'netease' as const
};

describe('dedupeMusic', () => {
  test('groups normalized exact matches', () => {
    const out = dedupeMusic([
      { ...base, id: '1', title: 'Song (Live)' },
      { ...base, id: '2', platform: 'qq', title: 'song', lyricsAvailable: true, audioUrl: 'x' }
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].canonical.id).toBe('2');
  });
});
