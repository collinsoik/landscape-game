import { NextRequest } from 'next/server';
import { proxyRoomRequest } from '@/lib/server/rooms-proxy';

export async function POST(request: NextRequest) {
  return proxyRoomRequest(request);
}
