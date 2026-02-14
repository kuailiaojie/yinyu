import test from 'node:test';
import assert from 'node:assert/strict';

import { aggregateMusicItems } from '../server/aggregate.js';

test('multi-platform aggregation keeps each MusicItem.platform value', () => {
  const items = aggregateMusicItems({
    netease: [
      { id: 'n-1', title: 'N Song', artist: 'N Artist' },
    ],
    qq: [
      { id: 'q-1', title: 'Q Song', artist: 'Q Artist' },
      { id: 'q-2', title: 'Q Song 2', artist: 'Q Artist 2' },
    ],
  });

  assert.deepEqual(
    items.map((item) => ({ id: item.id, platform: item.platform })),
    [
      { id: 'n-1', platform: 'netease' },
      { id: 'q-1', platform: 'qq' },
      { id: 'q-2', platform: 'qq' },
    ],
  );
});
