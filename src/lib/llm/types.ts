import type { MCPTool } from '../../types/mcp';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
  }>;
  toolCallId?: string;
  name?: string;
}

export interface LLMToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface LLMChatParams {
  messages: LLMMessage[];
  tools?: MCPTool[];
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  structuredOutputSchema?: Record<string, unknown>;
}

export interface LLMChatResponse {
  content: string;
  toolCalls?: LLMToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  id: string;
  name: string;
  chat(params: LLMChatParams): Promise<LLMChatResponse>;
  embed?(text: string): Promise<number[]>;
  isConfigured(): Promise<boolean>;
}
