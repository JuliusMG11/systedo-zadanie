import { NextRequest, NextResponse } from 'next/server';
import { getSessionMessages, saveChatExchange } from '@/lib/queries';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const sessionId = parseInt(req.nextUrl.searchParams.get('sessionId') ?? '0');
  if (!sessionId || sessionId <= 0) {
    return NextResponse.json({ messages: [] });
  }
  const messages = await getSessionMessages(sessionId);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    sessionId?: unknown;
    clientId?: unknown;
    userContent?: unknown;
    assistantContent?: unknown;
  };

  if (
    typeof body.sessionId !== 'number' ||
    typeof body.clientId !== 'number' ||
    typeof body.userContent !== 'string' ||
    typeof body.assistantContent !== 'string' ||
    !body.userContent.trim() ||
    !body.assistantContent.trim()
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  await saveChatExchange(body.sessionId, body.clientId, body.userContent, body.assistantContent);
  return NextResponse.json({ ok: true });
}
