import type { LLMProvider } from './types';
import { GeminiProvider } from './geminiProvider';
import { DemoProvider } from './demoProvider';
import { OpenAIProvider } from './openAIProvider';

const gemini = new GeminiProvider();
const demo = new DemoProvider();
const openai = new OpenAIProvider();

export function getProvider(providerId?: string): LLMProvider {
  if (providerId === 'openai') {
    return openai;
  }
  if (providerId === 'demo') {
    return demo;
  }
  return gemini;
}

export { gemini, demo, openai };
