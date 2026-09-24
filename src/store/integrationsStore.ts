import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Integration } from '../types/integrations';
import { mcpServer } from '../lib/mcp/server';

interface IntegrationsState {
  integrations: Integration[];
  toggleConnected: (id: string, connected: boolean) => void;
  toggleToolPermission: (integrationId: string, toolName: string) => void;
  getAllowedTools: () => string[];
  syncMCPServerTools: () => void;
}

const initialIntegrations: Integration[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'llm',
    description: 'Powers reasoning, native function calling, and multimodal embeddings via @google/genai.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['knowledge_search'],
    icon: 'Sparkles',
    docsUrl: 'https://ai.google.dev',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL Database',
    category: 'database',
    description: 'Read-replica database connection querying customer accounts, order tables, and audit logs.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['db_query_orders'],
    icon: 'Database',
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    category: 'crm',
    description: 'Bridges sales pipeline stages, contact profiles, deal values, and company associations.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['crm_search_contacts', 'crm_update_deal_stage'],
    icon: 'Users',
  },
  {
    id: 'zendesk',
    name: 'Zendesk Support',
    category: 'crm',
    description: 'Automated ticket creation and escalation routing for critical customer issues.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['create_support_ticket'],
    icon: 'LifeBuoy',
  },
  {
    id: 'gmail',
    name: 'Google Workspace / Gmail',
    category: 'communication',
    description: 'Transactional email notification gateway with human-in-the-loop dispatch protection.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['send_email'],
    icon: 'Mail',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    category: 'communication',
    description: 'Inspect calendar schedules and book customer consultation appointment windows.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['calendar_find_slots'],
    icon: 'Calendar',
  },
  {
    id: 'weather',
    name: 'OpenWeather API',
    category: 'webhook',
    description: 'Atmospheric lookup microservice with built-in network retry testing simulation.',
    connected: true,
    apiKeyConfigured: true,
    allowedTools: ['http_fetch_weather'],
    icon: 'CloudSun',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o',
    category: 'llm',
    description: 'Alternative LLM provider adapter with function-calling parameter specifications.',
    connected: false,
    apiKeyConfigured: false,
    allowedTools: [],
    icon: 'Bot',
    docsUrl: 'https://platform.openai.com',
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    category: 'payments',
    description: 'Subscription billing data, customer refund issuance, and dispute webhooks.',
    connected: false,
    apiKeyConfigured: false,
    allowedTools: [],
    icon: 'CreditCard',
  },
  {
    id: 'slack',
    name: 'Slack Alerts',
    category: 'communication',
    description: 'Post real-time agent notifications and approval requests directly to internal channels.',
    connected: false,
    apiKeyConfigured: false,
    allowedTools: [],
    icon: 'MessageSquare',
  },
];

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set, get) => ({
      integrations: initialIntegrations,

      toggleConnected: (id, connected) => {
        set((state) => ({
          integrations: state.integrations.map((item) =>
            item.id === id ? { ...item, connected } : item
          ),
        }));
        get().syncMCPServerTools();
      },

      toggleToolPermission: (integrationId, toolName) => {
        set((state) => ({
          integrations: state.integrations.map((item) => {
            if (item.id !== integrationId) return item;
            const exists = item.allowedTools.includes(toolName);
            const updated = exists
              ? item.allowedTools.filter((t) => t !== toolName)
              : [...item.allowedTools, toolName];
            return { ...item, allowedTools: updated };
          }),
        }));
        get().syncMCPServerTools();
      },

      getAllowedTools: () => {
        const allowed: string[] = [];
        for (const item of get().integrations) {
          if (item.connected) {
            allowed.push(...item.allowedTools);
          }
        }
        return Array.from(new Set(allowed));
      },

      syncMCPServerTools: () => {
        const allowed = get().getAllowedTools();
        mcpServer.setEnabledTools(allowed);
      },
    }),
    {
      name: 'relay_integrations_v1',
    }
  )
);
