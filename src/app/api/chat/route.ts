import { NextRequest, NextResponse } from 'next/server';
import { getChatHistory, saveChatExchange } from '@/lib/queries';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const clientId = parseInt(req.nextUrl.searchParams.get('clientId') ?? '0');
  if (!clientId || clientId <= 0) {
    return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
  }
  const messages = await getChatHistory(clientId);
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    clientId?: unknown;
    userContent?: unknown;
    assistantContent?: unknown;
  };

  if (
    typeof body.clientId !== 'number' ||
    typeof body.userContent !== 'string' ||
    typeof body.assistantContent !== 'string' ||
    !body.userContent.trim() ||
    !body.assistantContent.trim()
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  await saveChatExchange(body.clientId, body.userContent, body.assistantContent);
  return NextResponse.json({ ok: true });
}
