import assert from 'node:assert/strict';
import test from 'node:test';

import { createApp } from './index.js';

type FetchCall = { url: string; init?: RequestInit };

async function withServer(
  appFactory: () => ReturnType<typeof createApp>,
  run: (baseUrl: string) => Promise<void>
) {
  const app = appFactory();
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('unable to get server address');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

test('GET /api/tune/search validates keyword parameter', async () => {
  const fetchCalls: FetchCall[] = [];
  const fetchImpl: typeof fetch = async (url, init) => {
    fetchCalls.push({ url: String(url), init });
    return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  };

  await withServer(() => createApp({ fetchImpl }), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/tune/search?keyword=`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'keyword is required' });
    assert.equal(fetchCalls.length, 0);
  });
});

test('GET /api/tune/search enforces rate limit', async () => {
  const fetchImpl: typeof fetch = async (url) => {
    const target = String(url);
    if (target.includes('/v1/methods/')) {
      return new Response(
        JSON.stringify({ data: { method: 'GET', url: 'https://mock.platform/search', params: { keyword: '{{keyword}}' } } }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify([{ id: '1', title: 'Song', artist: 'Artist' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  await withServer(() => createApp({ fetchImpl, rateLimitMax: 1, rateLimitWindowMs: 60_000 }), async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/tune/search?keyword=test&platforms=netease`);
    assert.equal(first.status, 200);

    const second = await fetch(`${baseUrl}/api/tune/search?keyword=test&platforms=netease`);
    assert.equal(second.status, 429);
    assert.deepEqual(await second.json(), { error: 'Too many requests' });
  });
});

test('GET /api/tune/search uses cached method config', async () => {
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (url, init) => {
    const target = String(url);
    calls.push({ url: target, init });

    if (target.includes('/v1/methods/')) {
      return new Response(
        JSON.stringify({ data: { method: 'GET', url: 'https://mock.platform/search', params: { keyword: '{{keyword}}' } } }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify([{ id: '1', title: 'Song', artist: 'Artist' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  await withServer(() => createApp({ fetchImpl }), async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/tune/search?keyword=first&platforms=netease`);
    assert.equal(first.status, 200);

    const second = await fetch(`${baseUrl}/api/tune/search?keyword=second&platforms=netease`);
    assert.equal(second.status, 200);

    const methodCalls = calls.filter((entry) => entry.url.includes('/v1/methods/netease/search'));
    assert.equal(methodCalls.length, 1);
  });
});

test('GET /api/tune/search maps upstream failures to 502', async () => {
  const fetchImpl: typeof fetch = async (url) => {
    const target = String(url);
    if (target.includes('/v1/methods/')) {
      return new Response(JSON.stringify({ data: { method: 'GET', url: 'https://mock.platform/search' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    return new Response('oops', { status: 503 });
  };

  await withServer(() => createApp({ fetchImpl }), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/tune/search?keyword=test&platforms=netease`);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'Upstream unavailable' });
  });
});
