import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

// Proxy room creation to game server
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminToken = request.headers.get('x-admin-token') || '';

    const res = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

// Get room info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/api/rooms/${code}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to get room' }, { status: 500 });
  }
}
