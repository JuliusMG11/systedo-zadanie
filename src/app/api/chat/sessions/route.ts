import { NextRequest, NextResponse } from 'next/server';
import { getClientSessions, createChatSession } from '@/lib/queries';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const clientId = parseInt(req.nextUrl.searchParams.get('clientId') ?? '0');
  if (!clientId || clientId <= 0) {
    return NextResponse.json({ sessions: [] });
  }
  const sessions = await getClientSessions(clientId);
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { clientId?: unknown };
  if (typeof body.clientId !== 'number' || body.clientId <= 0) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }
  const session = await createChatSession(body.clientId);
  return NextResponse.json({ session });
}
