import { NextRequest, NextResponse } from 'next/server';
import { askAnalyst } from '@/lib/ai/analyst';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: unknown; clientId?: unknown };

    if (typeof body.question !== 'string' || body.question.trim().length === 0) {
      return NextResponse.json({ error: 'Neplatný dotaz' }, { status: 400 });
    }
    if (body.question.length > 500) {
      return NextResponse.json({ error: 'Dotaz je příliš dlouhý (max 500 znaků)' }, { status: 400 });
    }

    const clientId =
      typeof body.clientId === 'number' && Number.isInteger(body.clientId) && body.clientId > 0
        ? body.clientId : 1;

    const answer = await askAnalyst(body.question.trim(), clientId);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('[analyst route]', err);
    return NextResponse.json(
      { error: 'Omlouváme se, analytik momentálně není dostupný.' },
      { status: 500 }
    );
  }
}
