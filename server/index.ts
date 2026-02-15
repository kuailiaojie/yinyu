import express from 'express';

import { mapToMusicItem, type Platform } from './mappings.js';

type MethodConfig = {
  method?: 'GET' | 'POST';
  url?: string;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  transform?: string;
};

type CacheEntry = { expiresAt: number; value: unknown };

type ServerOptions = {
  tuneApiBase?: string;
  tuneApiKey?: string;
  rateLimitMax?: number;
  rateLimitWindowMs?: number;
  cacheTtlMs?: number;
  fetchImpl?: typeof fetch;
  now?: () => number;
};

const DEFAULT_TUNE_API_BASE = process.env.TUNE_API_BASE ?? 'https://tunehub.sayqz.com/api';
const DEFAULT_TUNE_API_KEY = process.env.TUNE_API_KEY;
const DEFAULT_PORT = Number(process.env.PORT ?? 3000);
const DEFAULT_RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 80);
const DEFAULT_RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const DEFAULT_CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 60_000);

const ALLOWED_PLATFORMS: Platform[] = ['netease', 'qq', 'kuwo'];

export function createApp(options: ServerOptions = {}) {
  const app = express();
  app.use(express.json());

  const tuneApiBase = options.tuneApiBase ?? DEFAULT_TUNE_API_BASE;
  const tuneApiKey = options.tuneApiKey ?? DEFAULT_TUNE_API_KEY;
  const rateLimitMax = options.rateLimitMax ?? DEFAULT_RATE_LIMIT_MAX;
  const rateLimitWindowMs = options.rateLimitWindowMs ?? DEFAULT_RATE_LIMIT_WINDOW_MS;
  const cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;

  const cache = new Map<string, CacheEntry>();
  const rateBucket = new Map<string, { count: number; resetAt: number }>();

  function getClientIp(req: express.Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0]?.trim() ?? 'unknown';
    }
    return req.ip ?? req.socket.remoteAddress ?? 'unknown';
  }

  function readCached(key: string): unknown | null {
    const item = cache.get(key);
    if (!item) return null;
    if (now() > item.expiresAt) {
      cache.delete(key);
      return null;
    }
    return item.value;
  }

  function writeCached(key: string, value: unknown): void {
    cache.set(key, { value, expiresAt: now() + cacheTtlMs });
  }

  function withKey(headers?: Record<string, string>): Record<string, string> {
    return {
      ...(headers ?? {}),
      ...(tuneApiKey ? { 'X-API-Key': tuneApiKey } : {}),
    };
  }

  function applyTemplate(value: unknown, vars: Record<string, string>): unknown {
    if (typeof value === 'string') {
      return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
    }

    if (Array.isArray(value)) return value.map((entry) => applyTemplate(entry, vars));

    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, applyTemplate(v, vars)]));
    }

    return value;
  }

  function toObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return value as Record<string, unknown>;
  }

  function parseArray(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) return payload.map((x) => toObject(x));
    const rec = toObject(payload);
    const nested = rec.data;
    if (Array.isArray(nested)) return nested.map((x) => toObject(x));
    if (nested && typeof nested === 'object') {
      const dataObj = nested as Record<string, unknown>;
      for (const key of ['list', 'songs']) {
        if (Array.isArray(dataObj[key])) return (dataObj[key] as unknown[]).map((x) => toObject(x));
      }
    }
    for (const key of ['list', 'songs']) {
      if (Array.isArray(rec[key])) return (rec[key] as unknown[]).map((x) => toObject(x));
    }
    return [];
  }

  function pickFirstString(rec: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = rec[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (typeof value === 'number') return String(value);
    }
    return '';
  }

  function pickArtist(value: unknown): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return value
        .map((entry) => {
          if (typeof entry === 'string') return entry;
          if (entry && typeof entry === 'object') {
            return pickFirstString(entry as Record<string, unknown>, ['name', 'artist']);
          }
          return '';
        })
        .filter(Boolean)
        .join('/');
    }
    if (value && typeof value === 'object') {
      return pickFirstString(value as Record<string, unknown>, ['name', 'artist']);
    }
    return '';
  }

  async function fetchMethodConfig(platform: Platform): Promise<MethodConfig> {
    const cacheKey = `method:${platform}:search`;
    const cached = readCached(cacheKey);
    if (cached) return cached as MethodConfig;

    const response = await fetchImpl(`${tuneApiBase}/v1/methods/${platform}/search`, { headers: withKey() });
    if (!response.ok) throw new Error('UPSTREAM_UNAVAILABLE');
    const json = (await response.json()) as { data?: MethodConfig };
    const value = json.data ?? {};
    writeCached(cacheKey, value);
    return value;
  }

  async function searchOne(platform: Platform, keyword: string): Promise<ReturnType<typeof mapToMusicItem>[]> {
    const config = await fetchMethodConfig(platform);
    if (!config.url) return [];

    const vars = { keyword, page: '1', pageSize: '30' };
    const params = toObject(applyTemplate(config.params ?? {}, vars));
    const body = applyTemplate(config.body ?? {}, vars);
    const url = new URL(config.url);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

    const response = await fetchImpl(url.toString(), {
      method: config.method ?? 'GET',
      headers: withKey(config.headers),
      body: (config.method ?? 'GET') === 'POST' ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) throw new Error('UPSTREAM_UNAVAILABLE');

    let raw: unknown = await response.text();
    try {
      raw = JSON.parse(String(raw));
    } catch {
      // keep plain text raw
    }

    if (config.transform) {
      try {
        const fn = new Function(`return (${config.transform});`)() as (input: unknown) => unknown;
        raw = fn(raw);
      } catch {
        // ignore invalid transform
      }
    }

    return parseArray(raw)
      .map((entry) => {
        const id = pickFirstString(entry, ['id', 'songid', 'songId', 'rid', 'mid']);
        const title = pickFirstString(entry, ['title', 'name', 'songname', 'songName']);
        const artist = pickFirstString(entry, ['artist', 'singer', 'artistName']) || pickArtist(entry.ar);
        if (!id || !title || !artist) return null;
        return mapToMusicItem(platform, { id, title, artist });
      })
      .filter((item): item is ReturnType<typeof mapToMusicItem> => Boolean(item));
  }

  app.use((req, res, next) => {
    const ip = getClientIp(req);
    const currentNow = now();
    const record = rateBucket.get(ip);

    if (!record || currentNow > record.resetAt) {
      rateBucket.set(ip, { count: 1, resetAt: currentNow + rateLimitWindowMs });
      return next();
    }

    if (record.count >= rateLimitMax) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    record.count += 1;
    return next();
  });

  app.get('/api/tune/search', async (req, res) => {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const platformList = typeof req.query.platforms === 'string' ? req.query.platforms : '';
    if (!keyword) return res.status(400).json({ error: 'keyword is required' });

    const requested = platformList
      .split(',')
      .map((x) => x.trim())
      .filter((x): x is Platform => ALLOWED_PLATFORMS.includes(x as Platform));
    const platforms = requested.length ? requested : ALLOWED_PLATFORMS;

    try {
      const result = await Promise.allSettled(platforms.map((platform) => searchOne(platform, keyword)));
      const items = result.flatMap((entry) => (entry.status === 'fulfilled' ? entry.value : []));
      if (items.length > 0) return res.json({ items });
      if (result.some((entry) => entry.status === 'rejected')) {
        return res.status(502).json({ error: 'Upstream unavailable' });
      }
      return res.json({ items: [] });
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/tune/song', async (req, res) => {
    const { platform, id, quality = '320k' } = req.body ?? {};
    if (!platform || !id) return res.status(400).json({ error: 'platform and id are required' });

    try {
      const response = await fetchImpl(`${tuneApiBase}/v1/parse`, {
        method: 'POST',
        headers: withKey({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ platform, ids: id, quality }),
      });

      if (!response.ok) return res.status(502).json({ error: 'Upstream unavailable' });

      const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
      const item = payload.data?.[0];
      if (!item) return res.status(404).json({ error: 'Song not found' });

      return res.json({
        id: String(item.id ?? ''),
        title: String(item.name ?? ''),
        artist: String(item.artist ?? ''),
        url: typeof item.url === 'string' ? item.url : undefined,
      });
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/tune/lyrics', async (req, res) => {
    const { platform, id } = req.body ?? {};
    if (!platform || !id) return res.status(400).json({ error: 'platform and id are required' });

    try {
      const response = await fetchImpl(`${tuneApiBase}/v1/parse`, {
        method: 'POST',
        headers: withKey({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ platform, ids: id, quality: '128k' }),
      });

      if (!response.ok) return res.status(502).json({ error: 'Upstream unavailable' });

      const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
      const item = payload.data?.[0];
      if (!item) return res.status(404).json({ error: 'Lyrics not found' });

      return res.json({
        id: String(item.id ?? ''),
        lyrics: typeof item.lyric === 'string' ? item.lyric : '',
      });
    } catch {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
}

export function startServer(port = DEFAULT_PORT) {
  const app = createApp();
  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on :${port}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
