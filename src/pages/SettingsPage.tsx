import React from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  RotateCcw,
  Check,
  HelpCircle,
} from 'lucide-react';
import { useSettingsStore, defaultSystemPrompt, type ApprovalPolicy } from '../store/settingsStore';

export const SettingsPage: React.FC = () => {
  const {
    model,
    temperature,
    maxSteps,
    approvalPolicy,
    systemPrompt,
    activeProviderId,
    setModel,
    setTemperature,
    setMaxSteps,
    setApprovalPolicy,
    setSystemPrompt,
    setActiveProviderId,
    resetDefaults,
  } = useSettingsStore();

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
              Agent & System Settings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure reasoning models, human-in-the-loop permission policies, and system prompts.
            </p>
          </div>

          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-6">
          {/* Provider & Model */}
          <div className="p-6 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-[#FF6B5B]" />
              <h2 className="text-sm font-semibold text-slate-900 font-heading">
                Language Model & Provider
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Execution Provider
                </label>
                <select
                  value={activeProviderId}
                  onChange={(e) => setActiveProviderId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ECECF1] bg-[#FAFAFB] text-slate-800 outline-none focus:border-amber-400"
                >
                  <option value="gemini">Google Gemini (@google/genai native)</option>
                  <option value="demo">Autonomous Demo Simulation Mode</option>
                  <option value="openai">OpenAI Adapter (GPT-4o Stub)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Switch between server-side Gemini, scripted portfolio demo, or OpenAI interface.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Target Foundation Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#ECECF1] bg-[#FAFAFB] text-slate-800 outline-none focus:border-amber-400 font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended Default)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced Reasoning)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Native tool-calling verified against @google/genai guidelines.
                </p>
              </div>
            </div>

            {/* Sliders: Temperature & Max Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Temperature</span>
                  <span className="font-mono text-slate-500 font-semibold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#FF6B5B] cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Lower values (0.1 - 0.3) provide precise tool schemas and deterministic arguments.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Maximum Agent Steps</span>
                  <span className="font-mono text-slate-500 font-semibold">{maxSteps} steps</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="16"
                  step="1"
                  value={maxSteps}
                  onChange={(e) => setMaxSteps(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FF6B5B] cursor-pointer"
                />
                <p className="text-[11px] text-slate-400">
                  Ceiling to protect against run runaway or deep recursive tool loops.
                </p>
              </div>
            </div>
          </div>

          {/* Human-in-the-loop Approval Policy */}
          <div className="p-6 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900 font-heading">
                Human-in-the-Loop Approval Policy
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'ask_all_writes',
                  title: 'Standard Guard',
                  desc: 'Pause for approval on all write mutations & sensitive actions (tickets, deal changes, email).',
                },
                {
                  id: 'ask_sensitive_only',
                  title: 'Sensitive Only',
                  desc: 'Auto-run CRM and ticket mutations; pause only for outbound customer emails.',
                },
                {
                  id: 'auto_approve',
                  title: 'Autonomous Flow',
                  desc: 'Auto-approve all tool invocations without modal confirmation prompts.',
                },
              ].map((policy) => {
                const isSelected = approvalPolicy === policy.id;
                return (
                  <div
                    key={policy.id}
                    onClick={() => setApprovalPolicy(policy.id as ApprovalPolicy)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                        : 'border-[#ECECF1] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs font-semibold text-slate-900">
                        {policy.title}
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {policy.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Prompt Editor */}
          <div className="p-6 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900 font-heading">
                Enterprise Agent System Instructions
              </h2>
              <span className="text-[11px] text-slate-400">
                Injected as systemInstruction
              </span>
            </div>

            <textarea
              rows={5}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3 text-xs font-mono rounded-xl border border-[#ECECF1] bg-[#FAFAFB] text-slate-800 outline-none focus:border-amber-400 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
