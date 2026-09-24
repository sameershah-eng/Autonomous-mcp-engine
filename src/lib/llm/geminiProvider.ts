import type { LLMProvider, LLMChatParams, LLMChatResponse } from './types';

export class GeminiProvider implements LLMProvider {
  public id = 'gemini';
  public name = 'Gemini 3.8 Flash (Server-side native)';
  private isKeyAvailable: boolean | null = null;

  public async isConfigured(): Promise<boolean> {
    if (this.isKeyAvailable !== null) {
      return this.isKeyAvailable;
    }
    try {
      const res = await fetch('/api/status');
      if (!res.ok) {
        this.isKeyAvailable = false;
        return false;
      }
      const data = await res.json();
      this.isKeyAvailable = Boolean(data.hasKey);
      return this.isKeyAvailable;
    } catch {
      this.isKeyAvailable = false;
      return false;
    }
  }

  public async chat(params: LLMChatParams): Promise<LLMChatResponse> {
    const isConfigured = await this.isConfigured();
    if (!isConfigured) {
      throw new Error(
        'Gemini API key is not detected in server environment. The application will seamlessly engage Demo Mode, or you can supply GEMINI_API_KEY in the environment secrets.'
      );
    }

    const response = await fetch('/api/llm/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: params.messages,
        tools: params.tools?.map((t) => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        })),
        systemPrompt: params.systemPrompt,
        temperature: params.temperature,
        model: params.model || 'gemini-3.8-flash',
        structuredOutputSchema: params.structuredOutputSchema,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Gemini API request failed with status ${response.status}`);
    }

    return (await response.json()) as LLMChatResponse;
  }

  public async embed(text: string): Promise<number[]> {
    const response = await fetch('/api/llm/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.embedding;
  }
}
