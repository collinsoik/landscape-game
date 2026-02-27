import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

// Get scores for a room
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/api/rooms/${code}/scores`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to get scores' }, { status: 500 });
  }
}

// Submit judge scores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const judgeToken = request.headers.get('x-judge-token') || '';
    const { roomCode, ...scores } = body;

    if (!roomCode) {
      return NextResponse.json({ error: 'Room code required' }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/api/rooms/${roomCode}/judge-scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-judge-token': judgeToken,
      },
      body: JSON.stringify({ ...scores, judgeToken }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to submit scores' }, { status: 500 });
  }
}
