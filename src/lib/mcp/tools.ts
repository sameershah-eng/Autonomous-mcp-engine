import type { MCPTool } from '../../types/mcp';
import {
  initialContacts,
  initialOrders,
  initialTickets,
  initialCalendarSlots,
  type Contact,
  type Order,
  type SupportTicket,
  type SentEmail,
} from './seedData';

// Mutable in-memory state for runtime mutations
export const dbContacts: Contact[] = [...initialContacts];
export const dbOrders: Order[] = [...initialOrders];
export const dbTickets: SupportTicket[] = [...initialTickets];
export const sentEmailsLog: SentEmail[] = [];

// Allow external hook for RAG knowledge search
let externalKnowledgeSearch: ((query: string, limit?: number) => Promise<unknown>) | null = null;

export function registerKnowledgeSearchHook(fn: (query: string, limit?: number) => Promise<unknown>) {
  externalKnowledgeSearch = fn;
}

export const mcpTools: MCPTool[] = [
  {
    name: 'crm_search_contacts',
    description: 'Search customer accounts, contacts, roles, and deal stages in CRM by name, email, or company name.',
    permission: 'read',
    category: 'crm',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term for contact name, company, role, or email (e.g. "Sarah", "Acme", "VP").',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of contacts to return (default: 5).',
        },
      },
      required: ['query'],
    },
    handler: async (args) => {
      const q = String(args.query || '').toLowerCase().trim();
      const limit = Number(args.limit) || 5;
      const matched = dbContacts.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q)
      );
      return {
        query: args.query,
        totalFound: matched.length,
        contacts: matched.slice(0, limit),
      };
    },
  },

  {
    name: 'crm_update_deal_stage',
    description: 'Update the pipeline stage and sales status for a customer deal in the CRM.',
    permission: 'write',
    category: 'crm',
    inputSchema: {
      type: 'object',
      properties: {
        dealId: {
          type: 'string',
          description: 'The contact or deal identifier (e.g., "cnt_101").',
        },
        stage: {
          type: 'string',
          enum: ['discovery', 'qualified', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'],
          description: 'The new deal stage in the CRM pipeline.',
        },
      },
      required: ['dealId', 'stage'],
    },
    handler: async (args) => {
      const dealId = String(args.dealId);
      const stage = String(args.stage);
      const contact = dbContacts.find((c) => c.id === dealId || c.email.includes(dealId));
      if (!contact) {
        throw new Error(`Contact/Deal ID "${dealId}" was not found in the CRM.`);
      }
      const previousStage = contact.dealStage;
      contact.dealStage = stage;
      return {
        success: true,
        dealId: contact.id,
        contactName: contact.name,
        previousStage,
        updatedStage: stage,
        dealValue: contact.dealValue,
        updatedAt: new Date().toISOString(),
      };
    },
  },

  {
    name: 'db_query_orders',
    description: 'Query mock PostgreSQL database for orders filtered by status and date range.',
    permission: 'read',
    category: 'database',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'pending', 'processing', 'completed', 'cancelled'],
          description: 'Filter orders by payment/fulfillment status.',
        },
        dateRange: {
          type: 'string',
          enum: ['last_week', 'this_month', 'all'],
          description: 'Time window to query records from PostgreSQL.',
        },
      },
      required: ['status'],
    },
    handler: async (args) => {
      const status = String(args.status || 'all');
      let results = [...dbOrders];
      if (status !== 'all') {
        results = results.filter((o) => o.status === status);
      }
      return {
        database: 'postgresql_primary_replica',
        table: 'customer_orders',
        filterApplied: { status, dateRange: args.dateRange || 'all' },
        rowCount: results.length,
        orders: results,
      };
    },
  },

  {
    name: 'create_support_ticket',
    description: 'Open a new high-priority or standard support escalation ticket in the customer helpdesk.',
    permission: 'write',
    category: 'ticketing',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Summary subject of the issue or order concern.',
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Urgency priority level for the helpdesk dispatch queue.',
        },
        customerId: {
          type: 'string',
          description: 'Contact identifier or email associated with the ticket.',
        },
      },
      required: ['title', 'priority', 'customerId'],
    },
    handler: async (args) => {
      const ticketNum = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket: SupportTicket = {
        id: `tck_${Date.now()}`,
        ticketNumber: ticketNum,
        title: String(args.title),
        priority: (args.priority as SupportTicket['priority']) || 'medium',
        customerId: String(args.customerId),
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      dbTickets.unshift(newTicket);
      return {
        success: true,
        ticket: newTicket,
        assignedQueue: args.priority === 'urgent' || args.priority === 'high' ? 'Tier-2 Critical Incident Team' : 'General Support Ops',
      };
    },
  },

  {
    name: 'send_email',
    description: 'Dispatch an outbound business email notification to a client or stakeholder.',
    permission: 'sensitive',
    category: 'communication',
    inputSchema: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          description: 'Recipient email address (e.g. "sarah.chen@acmeholdings.com").',
        },
        subject: {
          type: 'string',
          description: 'Subject line of the email message.',
        },
        body: {
          type: 'string',
          description: 'Full markdown or plain-text email message content.',
        },
      },
      required: ['to', 'subject', 'body'],
    },
    handler: async (args) => {
      const newEmail: SentEmail = {
        id: `mail_${Date.now()}`,
        to: String(args.to),
        subject: String(args.subject),
        body: String(args.body),
        sentAt: new Date().toISOString(),
      };
      sentEmailsLog.unshift(newEmail);
      return {
        delivered: true,
        messageId: `msg_${Math.random().toString(36).substring(2, 11)}@relay.platform`,
        recipient: args.to,
        subject: args.subject,
        timestamp: newEmail.sentAt,
      };
    },
  },

  {
    name: 'calendar_find_slots',
    description: 'Check schedule availability and retrieve open calendar meeting slots.',
    permission: 'read',
    category: 'productivity',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Target date in YYYY-MM-DD or relative format ("today", "tomorrow").',
        },
        durationMinutes: {
          type: 'number',
          description: 'Required meeting length in minutes (e.g. 30, 45, 60).',
        },
      },
      required: ['date', 'durationMinutes'],
    },
    handler: async (args) => {
      const available = initialCalendarSlots.filter((s) => s.available);
      return {
        dateRequested: args.date,
        requestedDuration: args.durationMinutes,
        timezone: 'America/New_York (EST)',
        availableSlots: available,
        recommendedSlot: available[0] || null,
      };
    },
  },

  {
    name: 'http_fetch_weather',
    description: 'Fetch real-time atmospheric and weather data for a city. Has simulated 25% transient network flakiness to verify retry resiliency.',
    permission: 'read',
    category: 'utility',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'City name (e.g., "San Francisco", "London", "Austin").',
        },
      },
      required: ['city'],
    },
    handler: async (args) => {
      // 25% failure chance to exercise retry with exponential backoff
      if (Math.random() < 0.25) {
        throw new Error(`HTTP 503 Service Unavailable: Remote weather gateway timeout for "${args.city}". Temporary upstream packet drop.`);
      }
      const city = String(args.city || 'San Francisco');
      return {
        city,
        condition: 'Clear & Sunny',
        temperatureC: 21,
        temperatureF: 70,
        humidity: '48%',
        windSpeed: '9 mph NW',
        cached: false,
        pingMs: 42,
      };
    },
  },

  {
    name: 'knowledge_search',
    description: 'Perform semantic similarity search over enterprise documentation, guides, and policies in Relay RAG knowledge base.',
    permission: 'read',
    category: 'knowledge',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language search query regarding policies, SLAs, or technical documentation.',
        },
        limit: {
          type: 'number',
          description: 'Number of relevant chunks to retrieve (default: 3).',
        },
      },
      required: ['query'],
    },
    handler: async (args) => {
      if (externalKnowledgeSearch) {
        return externalKnowledgeSearch(String(args.query), Number(args.limit) || 3);
      }
      return {
        query: args.query,
        chunks: [
          {
            id: 'chk_default_refund',
            title: 'Refund Policy & Credit Authorization',
            similarity: 0.92,
            snippet: 'All Relay SaaS subscriptions carry an unconditional 30-day money-back guarantee for first-time purchases. Support specialists can approve refunds up to $500 directly.',
          },
        ],
      };
    },
  },
];
