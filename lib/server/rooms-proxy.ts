import { NextRequest, NextResponse } from 'next/server';

export async function proxyRoomRequest(request: NextRequest, segments: string[] = []) {
  const [code, action] = segments;
  const validRoute = segments.length === 0
    ? request.method === 'POST'
    : /^[A-Z0-9]{6}$/.test(code) && (
      (segments.length === 1 && request.method === 'GET') ||
      (segments.length === 2 && (
        (request.method === 'GET' && ['submissions', 'results'].includes(action)) ||
        (request.method === 'POST' && ['submit', 'vote'].includes(action))
      ))
    );

  if (!validRoute) {
    return NextResponse.json({ error: 'Room endpoint not found' }, { status: 404 });
  }

  // Support existing deployments during migration; only read this on the server.
  // New deployments should use the server-only LANDSCAPE_API_URL variable.
  const upstream = process.env.LANDSCAPE_API_URL || process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:3004' : '');

  try {
    if (!upstream) throw new Error('Missing landscape API configuration');
    const suffix = segments.length ? `/${segments.join('/')}` : '';
    const response = await fetch(`${upstream.replace(/\/$/, '')}/api/rooms${suffix}`, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: request.method === 'POST' ? await request.text() : undefined,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(
      { error: 'The classroom service is temporarily unavailable. Your design is still saved in this tab. Please try again.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
