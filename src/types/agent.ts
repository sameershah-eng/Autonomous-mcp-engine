import type { ToolPermission } from './mcp';

export type StepStatus =
  | 'pending'
  | 'running'
  | 'awaiting_approval'
  | 'retrying'
  | 'success'
  | 'failed'
  | 'rejected';

export interface ExecutionStep {
  id: string;
  stepNumber: number;
  thought?: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: StepStatus;
  durationMs?: number;
  error?: string;
  retryCount?: number;
  permission: ToolPermission;
  timestamp: number;
}

export interface AgentSummary {
  summary: string;
  actionsTaken: string[];
  followUps: string[];
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, unknown>;
  }>;
  toolCallId?: string;
  name?: string;
  timestamp: number;
}

export interface AgentRun {
  id: string;
  instruction: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: ExecutionStep[];
  finalAnswer?: string;
  summaryCard?: AgentSummary;
  tokenUsage: TokenUsage;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  retriesTotal: number;
}

export interface ApprovalRequest {
  id: string;
  stepId: string;
  toolName: string;
  args: Record<string, unknown>;
  permission: ToolPermission;
  resolve: (decision: { approved: boolean; modifiedArgs?: Record<string, unknown> }) => void;
}
