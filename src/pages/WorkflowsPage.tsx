import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Wrench,
  Clock,
  Layers,
} from 'lucide-react';
import { useWorkflowsStore } from '../store/workflowsStore';
import { runAgentLoop } from '../lib/agent/agentLoop';
import type { WorkflowStep } from '../types/workflow';

export const WorkflowsPage: React.FC = () => {
  const { workflows, addWorkflow, deleteWorkflow, addStep, removeStep, reorderSteps, recordRun } =
    useWorkflowsStore();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const navigate = useNavigate();

  const selectedWf = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const handleRunWorkflow = async () => {
    if (!selectedWf || isExecuting) return;
    setIsExecuting(true);

    // Combine steps into instruction string
    const instructionLines = selectedWf.steps.map((s, idx) => {
      if (s.type === 'ai_instruction') {
        return `Step ${idx + 1}: ${s.instruction || s.title}`;
      } else {
        return `Step ${idx + 1}: Invoke tool ${s.toolName} with arguments ${JSON.stringify(s.args || {})}`;
      }
    });

    const fullPrompt = `Execute workflow "${selectedWf.name}":\n${instructionLines.join('\n')}`;

    navigate('/');
    try {
      await runAgentLoop(fullPrompt);
      recordRun(selectedWf.id, true);
    } catch {
      recordRun(selectedWf.id, false);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAddStep = (type: 'ai_instruction' | 'tool_call') => {
    if (!selectedWf) return;
    const newStep: WorkflowStep =
      type === 'ai_instruction'
        ? {
            id: `st_${Date.now()}`,
            type: 'ai_instruction',
            title: 'Custom AI Analysis Step',
            instruction: 'Analyze results and summarize recommendations.',
          }
        : {
            id: `st_${Date.now()}`,
            type: 'tool_call',
            title: 'Database Query Step',
            toolName: 'db_query_orders',
            args: { status: 'pending' },
          };
    addStep(selectedWf.id, newStep);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
              Workflow Automations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Assemble chained agent routines combining natural language reasoning with direct MCP tool calls.
            </p>
          </div>

          <button
            onClick={() =>
              addWorkflow({
                name: 'New Custom Automation',
                description: 'Custom chained sequence of tool calls and instructions.',
                trigger: 'Manual API Dispatch',
                steps: [
                  {
                    id: `st_${Date.now()}`,
                    type: 'ai_instruction',
                    title: 'Initial Evaluation',
                    instruction: 'Assess incoming request parameters.',
                  },
                ],
              })
            }
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Workflow</span>
          </button>
        </div>

        {/* Master-Detail Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Workflows List (4 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Active Automations ({workflows.length})
            </div>

            {workflows.map((wf) => {
              const isSelected = wf.id === selectedWorkflowId;
              return (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflowId(wf.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#FF6B5B] card-shadow ring-1 ring-[#FF6B5B]/20'
                      : 'bg-white/80 border-[#ECECF1] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-slate-900 font-heading">
                      {wf.name}
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {wf.successRate}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {wf.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {wf.steps.length} steps
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {wf.trigger}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Step Builder (7 cols) */}
          {selectedWf && (
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#ECECF1] card-shadow p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#ECECF1]">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-heading">
                    {selectedWf.name}
                  </h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Trigger: <span className="font-mono text-slate-600">{selectedWf.trigger}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteWorkflow(selectedWf.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete workflow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleRunWorkflow}
                    disabled={isExecuting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B5B] to-[#FFB547] text-white text-xs font-semibold shadow-xs hover:brightness-105 active:scale-98 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Now</span>
                  </button>
                </div>
              </div>

              {/* Steps Vertical List */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Execution Flow
                </div>

                {selectedWf.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-3.5 rounded-xl border border-[#ECECF1] bg-[#FAFAFB] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white border border-[#ECECF1] flex items-center justify-center font-semibold text-slate-700 text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 font-heading">
                            {step.title}
                          </span>
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              step.type === 'ai_instruction'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {step.type === 'ai_instruction' ? 'AI Instruction' : 'Tool Call'}
                          </span>
                        </div>

                        {step.type === 'ai_instruction' ? (
                          <div className="text-slate-600 text-[11px] leading-relaxed">
                            {step.instruction}
                          </div>
                        ) : (
                          <div className="font-mono text-[11px] text-slate-700">
                            <code>{step.toolName}</code>
                            {step.args && (
                              <span className="text-slate-400 ml-2">
                                ({Object.keys(step.args).join(', ')})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step reordering & deletion */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={() => reorderSteps(selectedWf.id, idx, idx - 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={idx === selectedWf.steps.length - 1}
                        onClick={() => reorderSteps(selectedWf.id, idx, idx + 1)}
                        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeStep(selectedWf.id, step.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Step Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleAddStep('ai_instruction')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Add AI Instruction</span>
                </button>
                <button
                  onClick={() => handleAddStep('tool_call')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50/50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-sky-500" />
                  <span>Add Tool Call</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
