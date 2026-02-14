import assert from 'node:assert/strict';
import test from 'node:test';

import { dedupeTracks } from '../src/features/search/utils/dedupe.ts';

test('dedupe: 英文大小写视为同曲', () => {
  const result = dedupeTracks([
    { title: 'Shape of You', durationSeconds: 233 },
    { title: 'shape OF you', durationSeconds: 234 },
  ]);

  assert.equal(result.length, 1);
});

test('dedupe: 括号后缀视为同曲', () => {
  const result = dedupeTracks([
    { title: '稻香 (Live)', durationSeconds: 221 },
    { title: '稻香', durationSeconds: 220 },
  ]);

  assert.equal(result.length, 1);
});

test('dedupe: 时长近似视为同曲', () => {
  const result = dedupeTracks([
    { title: '夜曲', durationSeconds: 223 },
    { title: '夜曲', durationSeconds: 225 },
  ]);

  assert.equal(result.length, 1);
});

test('dedupe: 繁简同曲合并', () => {
  const result = dedupeTracks([
    { title: '後來', durationSeconds: 301 },
    { title: '后来', durationSeconds: 300 },
  ]);

  assert.equal(result.length, 1);
});
