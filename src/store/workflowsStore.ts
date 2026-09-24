import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Workflow, WorkflowStep } from '../types/workflow';

interface WorkflowsState {
  workflows: Workflow[];
  addWorkflow: (wf: Omit<Workflow, 'id' | 'runCount' | 'successRate'>) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  addStep: (workflowId: string, step: WorkflowStep) => void;
  updateStep: (workflowId: string, stepId: string, updates: Partial<WorkflowStep>) => void;
  removeStep: (workflowId: string, stepId: string) => void;
  reorderSteps: (workflowId: string, startIndex: number, endIndex: number) => void;
  recordRun: (workflowId: string, success: boolean) => void;
}

const seededWorkflows: Workflow[] = [
  {
    id: 'wf_order_escalation',
    name: 'High-Value Order Escalation',
    description: 'Polls database orders, flags transactions over $500, and creates high-priority Zendesk tickets.',
    trigger: 'Webhook: on_order_created',
    lastRun: Date.now() - 1000 * 60 * 35,
    successRate: 98.4,
    runCount: 142,
    steps: [
      {
        id: 'st_1',
        type: 'ai_instruction',
        title: 'Evaluate Pending Orders',
        instruction: 'Find all pending orders from last week and open a high priority ticket for any over $500.',
      },
      {
        id: 'st_2',
        type: 'tool_call',
        title: 'Dispatch High-Priority Escalation Ticket',
        toolName: 'create_support_ticket',
        args: {
          title: 'High-Value Order Pending Review (> $500)',
          priority: 'urgent',
          customerId: 'cnt_101',
        },
      },
    ],
  },
  {
    id: 'wf_deal_nurture',
    name: 'Sales Pipeline Acceleration',
    description: 'Promotes qualified accounts to negotiation and sends branded client summary communications.',
    trigger: 'CRM: deal_stage_changed',
    lastRun: Date.now() - 1000 * 60 * 120,
    successRate: 95.8,
    runCount: 89,
    steps: [
      {
        id: 'st_3',
        type: 'ai_instruction',
        title: 'Locate Target Lead in CRM',
        instruction: 'Search CRM for Marcus Brody, update deal stage to negotiation, and send a summary email.',
      },
      {
        id: 'st_4',
        type: 'tool_call',
        title: 'Advance Deal Stage in CRM',
        toolName: 'crm_update_deal_stage',
        args: {
          dealId: 'cnt_102',
          stage: 'negotiation',
        },
      },
      {
        id: 'st_5',
        type: 'tool_call',
        title: 'Send Notification Email',
        toolName: 'send_email',
        args: {
          to: 'marcus@brodyanalytics.io',
          subject: 'Relay Platform - Commercial Terms in Negotiation',
          body: 'Marcus, your terms have been updated to the active negotiation stage.',
        },
      },
    ],
  },
  {
    id: 'wf_daily_brief',
    name: 'Daily Schedule & Weather Sync',
    description: 'Checks team consultation availability and weather conditions for executive morning briefings.',
    trigger: 'Cron: Everyday at 08:00 AM',
    lastRun: Date.now() - 1000 * 60 * 360,
    successRate: 92.5,
    runCount: 210,
    steps: [
      {
        id: 'st_6',
        type: 'tool_call',
        title: 'Retrieve Calendar Availability',
        toolName: 'calendar_find_slots',
        args: {
          date: 'tomorrow',
          durationMinutes: 45,
        },
      },
      {
        id: 'st_7',
        type: 'tool_call',
        title: 'Fetch Atmospheric Weather',
        toolName: 'http_fetch_weather',
        args: {
          city: 'San Francisco',
        },
      },
      {
        id: 'st_8',
        type: 'ai_instruction',
        title: 'Synthesize Daily Briefing',
        instruction: 'Summarize tomorrow meetings and weather in a clean bulleted report.',
      },
    ],
  },
];

export const useWorkflowsStore = create<WorkflowsState>()(
  persist(
    (set) => ({
      workflows: seededWorkflows,

      addWorkflow: (wf) =>
        set((state) => ({
          workflows: [
            {
              ...wf,
              id: `wf_${Date.now()}`,
              lastRun: undefined,
              successRate: 100,
              runCount: 0,
            },
            ...state.workflows,
          ],
        })),

      updateWorkflow: (id, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
        })),

      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
        })),

      addStep: (workflowId, step) =>
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId ? { ...w, steps: [...w.steps, step] } : w
          ),
        })),

      updateStep: (workflowId, stepId, updates) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            return {
              ...w,
              steps: w.steps.map((s) => (s.id === stepId ? { ...s, ...updates } : s)),
            };
          }),
        })),

      removeStep: (workflowId, stepId) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            return { ...w, steps: w.steps.filter((s) => s.id !== stepId) };
          }),
        })),

      reorderSteps: (workflowId, startIndex, endIndex) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const newSteps = Array.from(w.steps);
            const [moved] = newSteps.splice(startIndex, 1);
            newSteps.splice(endIndex, 0, moved);
            return { ...w, steps: newSteps };
          }),
        })),

      recordRun: (workflowId, success) =>
        set((state) => ({
          workflows: state.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const newCount = w.runCount + 1;
            const currentSuccessCount = Math.round((w.successRate / 100) * w.runCount);
            const newSuccessCount = currentSuccessCount + (success ? 1 : 0);
            return {
              ...w,
              runCount: newCount,
              lastRun: Date.now(),
              successRate: Number(((newSuccessCount / newCount) * 100).toFixed(1)),
            };
          }),
        })),
    }),
    {
      name: 'relay_workflows_v1',
    }
  )
);
