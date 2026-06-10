import { NextRequest, NextResponse } from 'next/server';
import { deleteChatSession, updateChatSessionTitle } from '@/lib/queries';

export const runtime = 'nodejs';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = parseInt(id);
  if (!sessionId || sessionId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  await deleteChatSession(sessionId);
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = parseInt(id);
  if (!sessionId || sessionId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const body = await req.json() as { title?: unknown };
  if (typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
  }
  await updateChatSessionTitle(sessionId, body.title.trim().slice(0, 100));
  return NextResponse.json({ ok: true });
}
