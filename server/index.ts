import express from 'express';

import { aggregateMusicItems } from './aggregate.js';

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

type MethodConfig = {
  method?: 'GET' | 'POST';
  url?: string;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  transform?: string;
};

function withAuthHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!API_KEY) return headers ?? {};
  return {
    ...(headers ?? {}),
    'X-API-Key': API_KEY,
  };
}

async function callUpstream(payload: Record<string, unknown>): Promise<ParseResponse> {
  if (!UPSTREAM_API_KEY) {
    throw new Error('UPSTREAM_API_KEY_MISSING');
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(UPSTREAM_URL, {
      method: 'POST',
      headers: withAuthHeaders({
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

async function fetchMethodConfig(platform: Platform): Promise<MethodConfig> {
  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${METHODS_URL}/${platform}/search`, {
      method: 'GET',
      headers: withAuthHeaders(),
    });
  } catch {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  if (!upstreamResponse.ok) {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  const payload = (await upstreamResponse.json()) as { data?: MethodConfig };
  return payload.data ?? {};
}

function fillTemplates(value: unknown, vars: Record<string, string>): unknown {
  if (typeof value === 'string') {
    return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
  }

  if (Array.isArray(value)) {
    return value.map((entry) => fillTemplates(entry, vars));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillTemplates(v, vars)]));
  }

  return value;
}

function toArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const rec = payload as Record<string, unknown>;
  if (Array.isArray(rec.data)) return rec.data;
  if (Array.isArray(rec.list)) return rec.list;
  if (Array.isArray(rec.songs)) return rec.songs;
  if (rec.data && typeof rec.data === 'object') {
    const dataRec = rec.data as Record<string, unknown>;
    if (Array.isArray(dataRec.list)) return dataRec.list;
    if (Array.isArray(dataRec.songs)) return dataRec.songs;
  }

  return [];
}

function readString(rec: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return '';
}

function pickArtist(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === 'string' ? x : typeof x === 'object' && x ? readString(x as Record<string, unknown>, ['name', 'artist']) : ''))
      .filter(Boolean)
      .join('/');
  }
  if (raw && typeof raw === 'object') {
    return readString(raw as Record<string, unknown>, ['name', 'artist']);
  }
  return '';
}

function normalizeSearchItems(platform: Platform, payload: unknown): Array<{ id: string; platform: Platform; title: string; artist: string }> {
  return toArray(payload)
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const rec = item as Record<string, unknown>;
      const id = readString(rec, ['id', 'songid', 'songId', 'rid', 'mid']);
      const title = readString(rec, ['title', 'name', 'songname', 'songName']);
      const artist = readString(rec, ['artist', 'singer', 'artistName']) || pickArtist(rec.ar);
      if (!id || !title || !artist) return null;
      return { id, platform, title, artist };
    })
    .filter((item): item is { id: string; platform: Platform; title: string; artist: string } => Boolean(item));
}

async function searchByPlatform(platform: Platform, keyword: string): Promise<Array<{ id: string; platform: Platform; title: string; artist: string }>> {
  const config = await fetchMethodConfig(platform);
  if (!config.url) return [];

  const vars = { keyword, page: '1', pageSize: '30' };
  const method = config.method ?? 'GET';
  const headers = withAuthHeaders(config.headers);

  const preparedParams = (fillTemplates(config.params ?? {}, vars) ?? {}) as Record<string, string>;
  const preparedBody = fillTemplates(config.body ?? {}, vars);

  const url = new URL(config.url);
  Object.entries(preparedParams).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(preparedBody) : undefined,
    });
  } catch {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  if (!response.ok) {
    throw new Error('UPSTREAM_UNAVAILABLE');
  }

  const text = await response.text();
  let raw: unknown = text;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = text;
  }

  if (config.transform) {
    try {
      const transform = new Function(`return (${config.transform});`)() as (input: unknown) => unknown;
      raw = transform(raw);
    } catch {
      // ignore transform evaluation error and fallback to raw payload
    }
  }

  return normalizeSearchItems(platform, raw);
}

app.get('/api/tune/search', async (req, res) => {
  const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
  const platformParam = typeof req.query.platforms === 'string' ? req.query.platforms : '';

  if (!keyword) {
    return res.status(400).json({ error: 'keyword is required' });
  }

  const requestedPlatforms = platformParam
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is Platform => ALLOWED_PLATFORMS.includes(value as Platform));

  const platforms = requestedPlatforms.length ? requestedPlatforms : ALLOWED_PLATFORMS;

  try {
    const settled = await Promise.allSettled(platforms.map((platform) => searchByPlatform(platform, keyword)));
    const items = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

    if (items.length > 0) {
      return res.json({ items });
    }

    const hasRejected = settled.some((result) => result.status === 'rejected');
    if (hasRejected) {
      return res.status(502).json({ error: 'Upstream unavailable' });
    }

    return res.json({ items: [] });
  } catch (error) {
    if (error instanceof Error && error.message === 'UPSTREAM_UNAVAILABLE') {
      return res.status(502).json({ error: 'Upstream unavailable' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});

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
