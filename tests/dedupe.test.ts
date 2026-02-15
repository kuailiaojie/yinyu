import { describe, expect, test } from 'vitest';

import { dedupeTracks } from '../src/features/search/utils/dedupe';

describe('dedupeTracks', () => {
  test('英文大小写视为同曲', () => {
    const result = dedupeTracks([
      { title: 'Shape of You', durationSeconds: 233 },
      { title: 'shape OF you', durationSeconds: 234 },
    ]);

    expect(result).toHaveLength(1);
  });

  test('括号后缀视为同曲', () => {
    const result = dedupeTracks([
      { title: '稻香 (Live)', durationSeconds: 221 },
      { title: '稻香', durationSeconds: 220 },
    ]);

    expect(result).toHaveLength(1);
  });

  test('时长近似视为同曲', () => {
    const result = dedupeTracks([
      { title: '夜曲', durationSeconds: 223 },
      { title: '夜曲', durationSeconds: 225 },
    ]);

    expect(result).toHaveLength(1);
  });

  test('繁简同曲合并', () => {
    const result = dedupeTracks([
      { title: '後來', durationSeconds: 301 },
      { title: '后来', durationSeconds: 300 },
    ]);

    expect(result).toHaveLength(1);
  });
});
