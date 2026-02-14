import express from 'express';

import { aggregateMusicItems } from './aggregate.js';

const app = express();
app.use(express.json());

const UPSTREAM_URL = process.env.TUNEHUB_UPSTREAM_URL ?? 'https://tunehub.sayqz.com/api/v1/parse';

type ParseItem = {
  id?: string | number;
  name?: string;
  artist?: string;
  url?: string;
  lyric?: string;
};

type ParseResponse = {
  data?: ParseItem[];
};

async function callUpstream(payload: Record<string, unknown>): Promise<ParseResponse> {
  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  if (!upstreamResponse.ok) {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  return (await upstreamResponse.json()) as ParseResponse;
}

app.post('/api/tune/song', async (req, res) => {
  const { platform, id, quality = '320k' } = req.body ?? {};

  try {
    const parsed = await callUpstream({
      platform,
      ids: id,
      quality,
    });

    const records = (parsed.data ?? []).map((item) => ({
      id: String(item.id ?? ''),
      title: item.name ?? '',
      artist: item.artist ?? '',
      url: item.url,
    }));

    const items = aggregateMusicItems(
      platform === 'netease'
        ? { netease: records }
        : platform === 'qq'
          ? { qq: records }
          : platform === 'kuwo'
            ? { kuwo: records }
            : {},
    );

    const item = items[0];
    if (!item) {
      return res.status(404).json({ error: 'Song not found' });
    }

    return res.json({
      id: item.id,
      title: item.title,
      artist: item.artist,
      url: item.url,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UPSTREAM_UNAVAILABLE') {
      return res.status(502).json({ error: 'Upstream unavailable' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tune/lyrics', async (req, res) => {
  const { platform, id } = req.body ?? {};

  try {
    const parsed = await callUpstream({
      platform,
      ids: id,
      quality: '128k',
    });

    const item = parsed.data?.[0];
    if (!item) {
      return res.status(404).json({ error: 'Lyrics not found' });
    }

    return res.json({
      id: item.id,
      lyrics: item.lyric ?? '',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UPSTREAM_UNAVAILABLE') {
      return res.status(502).json({ error: 'Upstream unavailable' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on :${port}`);
});
