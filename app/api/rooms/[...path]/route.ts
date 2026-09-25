import { NextRequest } from 'next/server';
import { proxyRoomRequest } from '@/lib/server/rooms-proxy';

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: Context) {
  return proxyRoomRequest(request, (await context.params).path);
}

export async function POST(request: NextRequest, context: Context) {
  return proxyRoomRequest(request, (await context.params).path);
}
