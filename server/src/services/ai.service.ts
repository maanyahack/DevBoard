import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/error.middleware.js';

interface GenerateTextParams {
  prompt: string;
  model?: string;
}

export interface GenerateTextResult {
  text: string;
}

const defaultModel = 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

function getAiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Gemini request failed';
}

export async function generateText({
  prompt,
  model = defaultModel,
}: GenerateTextParams): Promise<GenerateTextResult> {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return { text: response.text ?? '' };
  } catch (error) {
    throw new HttpError(502, 'AI service request failed', 'Bad Gateway', {
      provider: 'gemini',
      message: getAiErrorMessage(error),
    });
  }
}
