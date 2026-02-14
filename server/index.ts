import express from 'express';
import type { Request, Response } from 'express';
import { mapToMusicItem, type ParseRecord } from './mappings';
import type { Platform } from '../src/features/search/types';

const app = express();
app.use(express.json());

const API_BASE = process.env.TUNE_API_BASE ?? 'https://tunehub.sayqz.com/api';
const API_KEY = process.env.TUNE_API_KEY ?? '';
const ttl = Number(process.env.CACHE_TTL_MS ?? 30_000);
const perMinute = Number(process.env.RATE_LIMIT_PER_MINUTE ?? 60);

const cache = new Map<string, { expires: number; data: unknown }>();
const rate = new Map<string, { c: number; reset: number }>();

app.use((req, res, next) => {
  const ip = req.ip || 'local';
  const now = Date.now();
  const s = rate.get(ip) ?? { c: 0, reset: now + 60_000 };
  if (now > s.reset) {
    s.c = 0;
    s.reset = now + 60_000;
  }
  s.c += 1;
  rate.set(ip, s);
  if (s.c > perMinute) return res.status(429).json({ error: 'Too Many Requests' });
  next();
});

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data as T;
  const data = await fn();
  cache.set(key, { expires: Date.now() + ttl, data });
  return data;
}

async function tuneRequest(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
      ...(init?.headers ?? {})
    }
  });
  if (!res.ok) throw new Error(`Tune API ${res.status}`);
  return res.json();
}

app.get('/api/tune/search', async (req: Request, res: Response) => {
  try {
    const keyword = String(req.query.keyword ?? '');
    const platforms = String(req.query.platforms ?? 'netease,qq,kuwo').split(',') as Platform[];

    const rows = await cached(`s:${keyword}:${platforms.join(',')}`, async () => {
      const out: ParseRecord[] = [];
      for (const platform of platforms) {
        const methods = (await tuneRequest(`/v1/methods/${platform}/search`)) as { data: { url: string } };
        void methods;
        const parsed = (await tuneRequest('/v1/parse', {
          method: 'POST',
          body: JSON.stringify({ platform, ids: '1974443814', quality: '320k' })
        })) as { data?: ParseRecord[] };
        out.push(...(parsed.data ?? []));
      }
      return out;
    });

    res.json({ items: rows.map((r) => mapToMusicItem((r as any).platform ?? 'netease', r)) });
  } catch {
    res.status(502).json({ error: 'Upstream unavailable' });
  }
});

app.get('/api/tune/song', async (req, res) => {
  try {
    const platform = String(req.query.platform ?? 'netease') as Platform;
    const id = String(req.query.id ?? '');
    const parsed = (await tuneRequest('/v1/parse', {
      method: 'POST',
      body: JSON.stringify({ platform, ids: id, quality: '320k' })
    })) as { data?: ParseRecord[] };
    res.json({ item: mapToMusicItem(platform, parsed.data?.[0] as ParseRecord) });
  } catch {
    res.status(502).json({ error: 'Upstream unavailable' });
  }
});

app.get('/api/tune/lyrics', async (req, res) => {
  try {
    const platform = String(req.query.platform ?? 'netease') as Platform;
    const id = String(req.query.id ?? '');
    const parsed = (await tuneRequest('/v1/parse', {
      method: 'POST',
      body: JSON.stringify({ platform, ids: id, quality: '128k' })
    })) as { data?: ParseRecord[] };
    res.json({ lyrics: parsed.data?.[0]?.lyric ?? '' });
  } catch {
    res.status(502).json({ error: 'Upstream unavailable' });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`proxy listening on :${port}`);
});
