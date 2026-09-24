import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApprovalPolicy = 'ask_all_writes' | 'ask_sensitive_only' | 'auto_approve';

interface SettingsState {
  model: string;
  temperature: number;
  maxSteps: number;
  approvalPolicy: ApprovalPolicy;
  systemPrompt: string;
  activeProviderId: string;
  hasGeminiKey: boolean;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setMaxSteps: (steps: number) => void;
  setApprovalPolicy: (policy: ApprovalPolicy) => void;
  setSystemPrompt: (prompt: string) => void;
  setActiveProviderId: (id: string) => void;
  setHasGeminiKey: (has: boolean) => void;
  resetDefaults: () => void;
}

export const defaultSystemPrompt = `You are Relay, an autonomous AI automation engineer operating in enterprise environments.
You receive user instructions, deduce the exact set of MCP tools required, validate parameters, and execute multi-step workflows.
Always act responsibly with customer records and financial data. Explain your plan clearly before invoking write actions.`;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      model: 'gemini-3.8-flash',
      temperature: 0.2,
      maxSteps: 8,
      approvalPolicy: 'ask_all_writes',
      systemPrompt: defaultSystemPrompt,
      activeProviderId: 'gemini',
      hasGeminiKey: false,
      setModel: (model) => set({ model }),
      setTemperature: (temperature) => set({ temperature }),
      setMaxSteps: (maxSteps) => set({ maxSteps }),
      setApprovalPolicy: (approvalPolicy) => set({ approvalPolicy }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setActiveProviderId: (activeProviderId) => set({ activeProviderId }),
      setHasGeminiKey: (hasGeminiKey) => set({ hasGeminiKey }),
      resetDefaults: () =>
        set({
          model: 'gemini-3.8-flash',
          temperature: 0.2,
          maxSteps: 8,
          approvalPolicy: 'ask_all_writes',
          systemPrompt: defaultSystemPrompt,
          activeProviderId: 'gemini',
        }),
    }),
    {
      name: 'relay_settings_v1',
    }
  )
);
