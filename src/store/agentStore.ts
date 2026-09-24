import { create } from 'zustand';
import type { AgentMessage, ExecutionStep, ApprovalRequest, AgentSummary, TokenUsage } from '../types/agent';

interface AgentState {
  isRunning: boolean;
  messages: AgentMessage[];
  steps: ExecutionStep[];
  currentApproval: ApprovalRequest | null;
  summary: AgentSummary | null;
  tokenUsage: TokenUsage;
  activeRunId: string | null;
  isStreaming: boolean;
  streamingText: string;
  error: string | null;

  startRun: (runId: string, initialPrompt: string) => void;
  appendMessage: (message: AgentMessage) => void;
  updateLastMessage: (content: string) => void;
  addStep: (step: ExecutionStep) => void;
  updateStep: (id: string, updates: Partial<ExecutionStep>) => void;
  setApprovalRequest: (req: ApprovalRequest | null) => void;
  setSummary: (summary: AgentSummary | null) => void;
  setTokenUsage: (usage: TokenUsage) => void;
  setIsStreaming: (val: boolean) => void;
  setStreamingText: (text: string) => void;
  setError: (err: string | null) => void;
  finishRun: () => void;
  resetChat: () => void;
}

const initialUsage: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

export const useAgentStore = create<AgentState>((set) => ({
  isRunning: false,
  messages: [],
  steps: [],
  currentApproval: null,
  summary: null,
  tokenUsage: initialUsage,
  activeRunId: null,
  isStreaming: false,
  streamingText: '',
  error: null,

  startRun: (runId, initialPrompt) =>
    set({
      isRunning: true,
      activeRunId: runId,
      error: null,
      summary: null,
      steps: [],
      streamingText: '',
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: initialPrompt,
          timestamp: Date.now(),
        },
      ],
    }),

  appendMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateLastMessage: (content) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const last = state.messages[state.messages.length - 1];
      const updated = { ...last, content };
      return {
        messages: [...state.messages.slice(0, -1), updated],
      };
    }),

  addStep: (step) =>
    set((state) => ({
      steps: [...state.steps, step],
    })),

  updateStep: (id, updates) =>
    set((state) => ({
      steps: state.steps.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  setApprovalRequest: (currentApproval) => set({ currentApproval }),

  setSummary: (summary) => set({ summary }),

  setTokenUsage: (tokenUsage) => set({ tokenUsage }),

  setIsStreaming: (isStreaming) => set({ isStreaming }),

  setStreamingText: (streamingText) => set({ streamingText }),

  setError: (error) => set({ error, isRunning: false }),

  finishRun: () =>
    set({
      isRunning: false,
      isStreaming: false,
      currentApproval: null,
    }),

  resetChat: () =>
    set({
      isRunning: false,
      messages: [],
      steps: [],
      currentApproval: null,
      summary: null,
      tokenUsage: initialUsage,
      activeRunId: null,
      isStreaming: false,
      streamingText: '',
      error: null,
    }),
}));
