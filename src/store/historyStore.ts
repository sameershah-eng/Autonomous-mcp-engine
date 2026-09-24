import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgentRun } from '../types/agent';

interface HistoryState {
  runs: AgentRun[];
  addRun: (run: AgentRun) => void;
  updateRun: (id: string, updates: Partial<AgentRun>) => void;
  clearHistory: () => void;
  getRunById: (id: string) => AgentRun | undefined;
}

const seededRuns: AgentRun[] = [
  {
    id: 'run_101',
    instruction: 'Find all pending orders from last week and open a high priority ticket for any over $500.',
    status: 'completed',
    tokenUsage: { promptTokens: 1420, completionTokens: 280, totalTokens: 1700 },
    startedAt: Date.now() - 1000 * 60 * 35,
    completedAt: Date.now() - 1000 * 60 * 34,
    durationMs: 1420,
    retriesTotal: 0,
    summaryCard: {
      summary: 'Audited 4 pending customer orders, identified 3 orders exceeding $500, and created an expedited escalation ticket for ORD-2026-901.',
      actionsTaken: [
        'Queried PostgreSQL table `customer_orders` for pending status',
        'Evaluated capital limits against $500 rule',
        'Created urgent support ticket TCK-301 for Sarah Chen ($1,450.00)',
      ],
      followUps: [
        'Monitor Tier-2 support triage queue',
        'Check fulfillment status on Monday',
      ],
    },
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        thought: 'Querying database for pending orders from the past week.',
        toolName: 'db_query_orders',
        args: { status: 'pending', dateRange: 'last_week' },
        result: { rowCount: 4, orders: [{ orderNumber: 'ORD-2026-901', amount: 1450 }] },
        status: 'success',
        durationMs: 120,
        permission: 'read',
        timestamp: Date.now() - 1000 * 60 * 35,
      },
      {
        id: 'step_2',
        stepNumber: 2,
        thought: 'Order ORD-2026-901 is $1,450.00 which exceeds $500. Opening high-priority ticket.',
        toolName: 'create_support_ticket',
        args: { title: 'High-Value Order Escalation: ORD-2026-901 ($1,450.00)', priority: 'urgent', customerId: 'cnt_101' },
        result: { success: true, ticketNumber: 'TCK-301', assignedQueue: 'Tier-2 Critical Incident Team' },
        status: 'success',
        durationMs: 240,
        permission: 'write',
        timestamp: Date.now() - 1000 * 60 * 34.5,
      },
    ],
  },
  {
    id: 'run_102',
    instruction: 'Search CRM for Marcus Brody, update deal stage to negotiation, and send a summary email.',
    status: 'completed',
    tokenUsage: { promptTokens: 1850, completionTokens: 310, totalTokens: 2160 },
    startedAt: Date.now() - 1000 * 60 * 120,
    completedAt: Date.now() - 1000 * 60 * 118,
    durationMs: 2100,
    retriesTotal: 0,
    summaryCard: {
      summary: 'Promoted Brody Analytics deal to Negotiation stage in CRM and dispatched signed summary email.',
      actionsTaken: [
        'Queried CRM for contact Marcus Brody',
        'Advanced deal stage from proposal_sent to negotiation',
        'Sent confirmation email to marcus@brodyanalytics.io',
      ],
      followUps: [
        'Await client legal feedback on worker seats',
      ],
    },
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        toolName: 'crm_search_contacts',
        args: { query: 'Marcus Brody', limit: 2 },
        result: { totalFound: 1, contacts: [{ id: 'cnt_102', name: 'Marcus Brody', company: 'Brody Analytics' }] },
        status: 'success',
        durationMs: 85,
        permission: 'read',
        timestamp: Date.now() - 1000 * 60 * 120,
      },
      {
        id: 'step_2',
        stepNumber: 2,
        toolName: 'crm_update_deal_stage',
        args: { dealId: 'cnt_102', stage: 'negotiation' },
        result: { success: true, updatedStage: 'negotiation' },
        status: 'success',
        durationMs: 160,
        permission: 'write',
        timestamp: Date.now() - 1000 * 60 * 119,
      },
      {
        id: 'step_3',
        stepNumber: 3,
        toolName: 'send_email',
        args: { to: 'marcus@brodyanalytics.io', subject: 'Deal update: Negotiation Phase', body: 'Marcus...' },
        result: { delivered: true, messageId: 'msg_981a2f@relay.platform' },
        status: 'success',
        durationMs: 310,
        permission: 'sensitive',
        timestamp: Date.now() - 1000 * 60 * 118,
      },
    ],
  },
  {
    id: 'run_103',
    instruction: 'Find open meeting slots for tomorrow and check weather in San Francisco.',
    status: 'completed',
    tokenUsage: { promptTokens: 980, completionTokens: 190, totalTokens: 1170 },
    startedAt: Date.now() - 1000 * 60 * 240,
    completedAt: Date.now() - 1000 * 60 * 238,
    durationMs: 1840,
    retriesTotal: 1,
    summaryCard: {
      summary: 'Retrieved 3 open meeting slots for tomorrow and recovered weather data after 1 transient upstream network retry.',
      actionsTaken: [
        'Queried calendar availability for 45-minute slots',
        'Fetched weather conditions with retry backoff for San Francisco',
      ],
      followUps: [],
    },
    steps: [
      {
        id: 'step_1',
        stepNumber: 1,
        toolName: 'calendar_find_slots',
        args: { date: 'tomorrow', durationMinutes: 45 },
        result: { availableSlots: [{ startTime: '09:00 AM' }, { startTime: '02:00 PM' }] },
        status: 'success',
        durationMs: 110,
        permission: 'read',
        timestamp: Date.now() - 1000 * 60 * 240,
      },
      {
        id: 'step_2',
        stepNumber: 2,
        toolName: 'http_fetch_weather',
        args: { city: 'San Francisco' },
        result: { city: 'San Francisco', condition: 'Clear & Sunny', temperatureF: 70 },
        status: 'success',
        retryCount: 1,
        durationMs: 820,
        permission: 'read',
        timestamp: Date.now() - 1000 * 60 * 238,
      },
    ],
  },
];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      runs: seededRuns,

      addRun: (run) =>
        set((state) => ({
          runs: [run, ...state.runs],
        })),

      updateRun: (id, updates) =>
        set((state) => ({
          runs: state.runs.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      clearHistory: () => set({ runs: [] }),

      getRunById: (id) => get().runs.find((r) => r.id === id),
    }),
    {
      name: 'relay_history_v1',
    }
  )
);
