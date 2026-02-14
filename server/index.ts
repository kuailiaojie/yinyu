import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

const TUNEHUB_API_BASE = process.env.TUNEHUB_API_BASE ?? 'https://tunehub.sayqz.com/api';
const TUNEHUB_API_KEY = process.env.TUNEHUB_API_KEY ?? '';

interface MethodConfig {
  type: 'http';
  method: 'GET' | 'POST';
  url: string;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  transform?: string;
}

interface ParseRecord {
  id: string;
  name: string;
  artists: string[];
  album?: string;
}

interface MusicItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  platform: string;
}

function replaceTemplateVariables(value: unknown, vars: Record<string, string>): unknown {
  if (typeof value === 'string') {
    let out = value;
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{{${k}}}`, v);
    }
    return out;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceTemplateVariables(item, vars));
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = replaceTemplateVariables(v, vars);
    }
    return result;
  }

  return value;
}

async function fetchMethodConfig(platform: string, fn: string): Promise<MethodConfig> {
  const configUrl = `${TUNEHUB_API_BASE}/v1/methods/${encodeURIComponent(platform)}/${encodeURIComponent(fn)}`;
  const response = await fetch(configUrl, {
    headers: {
      ...(TUNEHUB_API_KEY ? { 'X-API-Key': TUNEHUB_API_KEY } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`failed to fetch method config: ${response.status}`);
  }

  const payload = (await response.json()) as { data?: MethodConfig };
  if (!payload?.data?.url || !payload.data.method) {
    throw new Error('invalid method config response');
  }

  return payload.data;
}

function pickArrayCandidates(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  const candidates = [obj.items, obj.list, obj.songs, obj.data, obj.result, obj.records];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === 'object') {
      const nested = pickArrayCandidates(candidate);
      if (nested.length > 0) return nested;
    }
  }

  for (const value of Object.values(obj)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function toParseRecord(item: unknown): ParseRecord | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as Record<string, unknown>;

  const id = raw.id ?? raw.songid ?? raw.mid ?? raw.rid ?? raw.musicrid;
  const name = raw.name ?? raw.songname ?? raw.title;
  const album = raw.album ?? raw.albumname ?? raw.albumName;

  const artistsSource = raw.artists ?? raw.artist ?? raw.singer ?? raw.author;
  let artists: string[] = [];

  if (Array.isArray(artistsSource)) {
    artists = artistsSource
      .map((v) => {
        if (typeof v === 'string') return v;
        if (v && typeof v === 'object') {
          const o = v as Record<string, unknown>;
          return typeof o.name === 'string' ? o.name : '';
        }
        return '';
      })
      .filter(Boolean);
  } else if (typeof artistsSource === 'string') {
    artists = artistsSource.split(/[\/,;&]/).map((v) => v.trim()).filter(Boolean);
  }

  if (!id || !name) return null;

  return {
    id: String(id),
    name: String(name),
    artists,
    album: typeof album === 'string' ? album : undefined,
  };
}

function parseRecordToMusicItem(record: ParseRecord, platform: string): MusicItem {
  return {
    id: record.id,
    title: record.name,
    artist: record.artists.join(' / '),
    album: record.album,
    platform,
  };
}

app.get('/api/tune/search', async (req: Request, res: Response) => {
  try {
    const platform = String(req.query.platform ?? 'netease');
    const keyword = String(req.query.keyword ?? '').trim();
    const page = String(req.query.page ?? '1');
    const pageSize = String(req.query.pageSize ?? '20');

    if (!keyword) {
      return res.status(400).json({ message: 'keyword is required' });
    }

    // 1) 获取平台 search 方法配置
    const methodConfig = await fetchMethodConfig(platform, 'search');

    // 2) 按模板变量规则替换 {{keyword}}/{{page}}/{{pageSize}}
    const variables = { keyword, page, pageSize };
    const params = replaceTemplateVariables(methodConfig.params ?? {}, variables) as Record<string, string>;
    const body = replaceTemplateVariables(methodConfig.body ?? {}, variables) as Record<string, unknown>;

    // 3) 服务端发起真实搜索请求
    const url = new URL(methodConfig.url);
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }

    const upstreamRes = await fetch(url.toString(), {
      method: methodConfig.method,
      headers: methodConfig.headers,
      body: methodConfig.method === 'POST' ? JSON.stringify(body) : undefined,
    });

    if (!upstreamRes.ok) {
      return res.status(502).json({ message: `upstream search failed: ${upstreamRes.status}` });
    }

    const upstreamData = (await upstreamRes.json()) as unknown;

    // 4) 各平台结果统一转换为 ParseRecord，再转换为 MusicItem，并保留平台来源
    const records = pickArrayCandidates(upstreamData)
      .map(toParseRecord)
      .filter((v): v is ParseRecord => Boolean(v));

    const items = records.map((r) => parseRecordToMusicItem(r, platform));

    return res.json({ items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'internal error' });
  }
});

export default app;
