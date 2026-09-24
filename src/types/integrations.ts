export interface Integration {
  id: string;
  name: string;
  category: 'llm' | 'database' | 'crm' | 'communication' | 'payments' | 'webhook';
  description: string;
  connected: boolean;
  apiKeyConfigured: boolean;
  allowedTools: string[];
  icon: string;
  docsUrl?: string;
}
