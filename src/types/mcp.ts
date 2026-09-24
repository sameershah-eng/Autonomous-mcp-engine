export type ToolPermission = 'read' | 'write' | 'sensitive';

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: {
    type: string;
    enum?: string[];
  };
  default?: unknown;
}

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  permission: ToolPermission;
  category: 'crm' | 'database' | 'ticketing' | 'communication' | 'productivity' | 'utility' | 'knowledge';
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  content: string;
  description: string;
}

export interface ToolCallResult {
  success: boolean;
  data?: unknown;
  error?: string;
  durationMs: number;
  attempts?: number;
}
