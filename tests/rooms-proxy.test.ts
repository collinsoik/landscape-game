import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { NextRequest } from 'next/server';
import { proxyRoomRequest } from '../lib/server/rooms-proxy';

const originalFetch = globalThis.fetch;
const originalOrigin = process.env.LANDSCAPE_API_URL;
process.env.LANDSCAPE_API_URL = 'https://classroom-backend.example';
after(() => {
  globalThis.fetch = originalFetch;
  if (originalOrigin === undefined) delete process.env.LANDSCAPE_API_URL;
  else process.env.LANDSCAPE_API_URL = originalOrigin;
});

for (const [method, path] of [
  ['POST', []], ['GET', ['ABC123']], ['POST', ['ABC123', 'submit']],
  ['GET', ['ABC123', 'submissions']], ['POST', ['ABC123', 'vote']],
  ['GET', ['ABC123', 'results']],
] as [string, string[]][]) {
  test(`${method} rooms/${path.join('/')} stays behind the proxy`, async () => {
    const body = JSON.stringify({ landscapeId: 'coastal', playerName: 'Test Gardener' });
    globalThis.fetch = async (url, options) => {
      assert.equal(url, `https://classroom-backend.example/api/rooms${path.length ? '/' + path.join('/') : ''}`);
      assert.equal(options?.method, method);
      assert.equal(options?.cache, 'no-store');
      assert.equal(options?.redirect, 'error');
      assert.equal(options?.body, method === 'POST' ? body : undefined);
      return Response.json({ landscapeId: 'coastal' });
    };
    const response = await proxyRoomRequest(new NextRequest('https://www.opendoorengineering.org/games/landscape-game/api/rooms', {
      method, body: method === 'POST' ? body : undefined,
    }), path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { landscapeId: 'coastal' });
  });
}

test('preserves room-not-found errors', async () => {
  globalThis.fetch = async () => Response.json({ error: 'Room not found' }, { status: 404 });
  const response = await proxyRoomRequest(new NextRequest('https://example.org'), ['ABC123']);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Room not found' });
});

test('rejects unknown paths without reaching the backend', async () => {
  globalThis.fetch = async () => { throw new Error('must not fetch'); };
  const response = await proxyRoomRequest(new NextRequest('https://example.org'), ['ABC123', 'unknown']);
  assert.equal(response.status, 404);
});

test('backend outage returns a retryable JSON error', async () => {
  globalThis.fetch = async () => { throw new TypeError('network unavailable'); };
  const response = await proxyRoomRequest(new NextRequest('https://example.org'), ['ABC123']);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /try again/);
});

test('HTML gateway error returns a retryable JSON error', async () => {
  globalThis.fetch = async () => new Response('<html>Unavailable</html>', { status: 502 });
  const response = await proxyRoomRequest(new NextRequest('https://example.org'), ['ABC123']);
  assert.equal(response.status, 503);
});
