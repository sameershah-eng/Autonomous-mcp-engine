export type WorkflowStepType = 'ai_instruction' | 'tool_call';

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  title: string;
  instruction?: string;
  toolName?: string;
  args?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  lastRun?: number;
  successRate: number;
  runCount: number;
}
