// Import the Google Generative AI SDK (Gemini) for AI text generation.
import { GoogleGenAI } from '@google/genai';

// Import validated env config to access the GEMINI_API_KEY.
import { env } from '../config/env.js';

// Import HttpError for throwing HTTP-specific errors when AI calls fail.
import { HttpError } from '../middleware/error.middleware.js';

// TypeScript 'interface' — defines the shape of the parameters object.
// The '?' on 'model' makes it optional — callers can skip it and get the default.
interface GenerateTextParams {
  prompt: string;   // The text prompt to send to the AI model
  model?: string;   // Optional model name override (e.g., 'gemini-2.5-flash')
}

// TypeScript 'interface' — defines what the function returns.
// The response will always have a 'text' property containing the AI's answer.
export interface GenerateTextResult {
  text: string;
}

// The default AI model to use if none is specified. Gemini 2.5 Flash is fast and cheap.
const defaultModel = 'gemini-2.5-flash';

// Create a Gemini AI client instance with the API key from env config.
// This client is reusable across multiple requests.
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Helper to extract a readable error message from any error type.
 * The Gemini SDK can throw various error types, so we normalize them.
 */
function getAiErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;  // Standard Error — use its message property
  }
  return 'Gemini request failed';  // Fallback for non-Error values
}

/**
 * generateText — sends a prompt to the Gemini AI model and returns the response.
 *
 * This is the core AI function used by controllers for features like
 * note summarization, task generation, and dashboard insights.
 */
export async function generateText({
  prompt,               // Destructure the params object into individual variables
  model = defaultModel, // Destructure with a default value — if model isn't passed, use default
}: GenerateTextParams): Promise<GenerateTextResult> {
  try {
    // Send the prompt to the Gemini API.
    // 'ai.models.generateContent' is the SDK method that calls Google's servers.
    const response = await ai.models.generateContent({
      model,             // Which AI model to use
      contents: prompt,  // The actual text prompt
    });

    // Return the generated text. 'response.text' may be null/undefined
    // if the model didn't produce text, so we default to empty string.
    return { text: response.text ?? '' };
  } catch (error) {
    // If the Gemini API call fails (network error, rate limit, invalid key, etc.),
    // throw an HttpError with status 502 (Bad Gateway) — meaning our server
    // received an invalid response from an upstream service.
    throw new HttpError(502, 'AI service request failed', 'Bad Gateway', {
      provider: 'gemini',          // Which AI provider failed
      message: getAiErrorMessage(error),  // Human-readable error
    });
  }
}
