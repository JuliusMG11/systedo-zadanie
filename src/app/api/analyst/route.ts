// src/app/api/analyst/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAnalystContext } from '@/lib/queries';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/ai/prompt';

export const runtime = 'nodejs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { question?: unknown; range?: unknown };

    if (typeof body.question !== 'string' || body.question.trim().length === 0) {
      return NextResponse.json({ error: 'Neplatný dotaz' }, { status: 400 });
    }
    if (body.question.length > 500) {
      return NextResponse.json({ error: 'Dotaz je příliš dlouhý (max 500 znaků)' }, { status: 400 });
    }

    const snapshot = await getAnalystContext(1); // client_id = 1 (mionelo)

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      buildUserPrompt(body.question.trim(), snapshot)
    );

    return NextResponse.json({ answer: result.response.text() });
  } catch (err) {
    console.error('[analyst route]', err);
    return NextResponse.json(
      { error: 'Omlouváme se, analytik momentálně není dostupný.' },
      { status: 500 }
    );
  }
}
