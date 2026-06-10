import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAnalystContext } from '@/lib/queries';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/ai/prompt';

export async function askAnalyst(question: string, clientId: number): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const snapshot = await getAnalystContext(clientId);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
  const result = await model.generateContent(buildUserPrompt(question, snapshot));
  return result.response.text();
}
