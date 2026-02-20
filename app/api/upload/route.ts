import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Proxy image upload to game server
export async function POST(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token') || '';
    const formData = await request.formData();

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'x-admin-token': adminToken },
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
