/**
 * OpenAI Provider Adapter (Stub)
 *
 * Implements the standard LLMProvider interface for OpenAI's Chat Completions API
 * with native Function Calling / Tools support.
 *
 * Request Format Specification:
 * - EndPoint: https://api.openai.com/v1/chat/completions
 * - Schema Conversion: MCP tools are mapped into OpenAI tools:
 *     tools: [
 *       {
 *         type: "function",
 *         function: {
 *           name: tool.name,
 *           description: tool.description,
 *           parameters: tool.inputSchema // JSON Schema object
 *         }
 *       }
 *     ]
 * - Tool Choice: "auto"
 * - Response Parsing:
 *     Inspect response.choices[0].message.tool_calls:
 *     [
 *       {
 *         id: "call_abc123",
 *         type: "function",
 *         function: {
 *           name: "crm_search_contacts",
 *           arguments: "{\"query\": \"Sarah\"}" // serialized JSON string
 *         }
 *       }
 *     ]
 */

import type { LLMProvider, LLMChatParams, LLMChatResponse, LLMToolCall } from './types';

export class OpenAIProvider implements LLMProvider {
  public id = 'openai';
  public name = 'OpenAI (GPT-4o)';
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  public async isConfigured(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  public async chat(params: LLMChatParams): Promise<LLMChatResponse> {
    if (!this.apiKey) {
      throw new Error(
        'OpenAI API key is not configured. Please supply an API key in Integrations > OpenAI or switch to Gemini / Demo mode.'
      );
    }

    // Map MCP Tools to OpenAI function calling specifications
    const openAITools = params.tools?.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.inputSchema.properties,
          required: tool.inputSchema.required || [],
        },
      },
    }));

    // Transform internal messages into OpenAI message objects
    const openAIMessages = params.messages.map((msg) => {
      if (msg.role === 'tool') {
        return {
          role: 'tool' as const,
          tool_call_id: msg.toolCallId || 'call_default',
          content: msg.content,
        };
      }
      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        return {
          role: 'assistant' as const,
          content: msg.content || null,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.args),
            },
          })),
        };
      }
      return {
        role: msg.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      };
    });

    if (params.systemPrompt) {
      openAIMessages.unshift({
        role: 'system' as any,
        content: params.systemPrompt,
      });
    }

    // Execute standard OpenAI Chat Completions API request
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model || 'gpt-4o',
        messages: openAIMessages,
        tools: openAITools && openAITools.length > 0 ? openAITools : undefined,
        tool_choice: openAITools && openAITools.length > 0 ? 'auto' : undefined,
        temperature: params.temperature ?? 0.2,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error ${response.status}: ${errJson.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const message = choice?.message;

    const parsedToolCalls: LLMToolCall[] = [];
    if (message?.tool_calls && Array.isArray(message.tool_calls)) {
      for (const call of message.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || '{}');
        } catch {
          args = {};
        }
        parsedToolCalls.push({
          id: call.id,
          name: call.function.name,
          args,
        });
      }
    }

    return {
      content: message?.content || '',
      toolCalls: parsedToolCalls.length > 0 ? parsedToolCalls : undefined,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
