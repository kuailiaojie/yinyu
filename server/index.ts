import express from 'express';

const app = express();
app.use(express.json());

const UPSTREAM_URL = process.env.TUNEHUB_UPSTREAM_URL ?? 'https://tunehub.sayqz.com/api/v1/parse';
const UPSTREAM_API_KEY = process.env.TUNEHUB_API_KEY;

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
  if (!UPSTREAM_API_KEY) {
    throw new Error('UPSTREAM_API_KEY_MISSING');
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': UPSTREAM_API_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
    throw new Error('UPSTREAM_AUTH_FAILED');
  }

  if (upstreamResponse.status >= 500) {
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

    const item = parsed.data?.[0];
    if (!item) {
      return res.status(404).json({ error: 'Song not found' });
    }

    return res.json({
      id: item.id,
      title: item.name,
      artist: item.artist,
      url: item.url,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UPSTREAM_API_KEY_MISSING') {
      return res.status(500).json({ error: 'Server misconfigured: missing TUNEHUB_API_KEY' });
    }

    if (error instanceof Error && error.message === 'UPSTREAM_AUTH_FAILED') {
      return res.status(500).json({ error: 'Upstream authentication failed' });
    }

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
    if (error instanceof Error && error.message === 'UPSTREAM_API_KEY_MISSING') {
      return res.status(500).json({ error: 'Server misconfigured: missing TUNEHUB_API_KEY' });
    }

    if (error instanceof Error && error.message === 'UPSTREAM_AUTH_FAILED') {
      return res.status(500).json({ error: 'Upstream authentication failed' });
    }

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
