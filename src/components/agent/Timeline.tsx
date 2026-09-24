import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import type { ExecutionStep, StepStatus } from '../../types/agent';

interface TimelineProps {
  steps: ExecutionStep[];
  isRunning: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, isRunning }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: StepStatus, retryCount?: number) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Executing
          </span>
        );
      case 'awaiting_approval':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            Awaiting Approval
          </span>
        );
      case 'retrying':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <RotateCw className="w-3 h-3 text-amber-600 animate-spin" />
            Retry Attempt {retryCount ?? 1}/3
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Success
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            Declined
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#ECECF1] card-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#ECECF1] flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900 font-heading">
            Live Execution Timeline
          </h3>
        </div>
        <div className="text-xs text-slate-500">
          {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {steps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-600">No active tool executions</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Type a prompt or choose a starter workflow to watch live MCP tool invocations.
            </p>
          </div>
        ) : (
          steps.map((step) => {
            const isExpanded = expandedSteps[step.id] ?? false;

            return (
              <div
                key={step.id}
                className="p-3.5 rounded-xl border border-[#ECECF1] bg-[#FAFAFB] hover:border-slate-300 transition-all text-xs"
              >
                {/* Step Top Bar */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-5 h-5 rounded-full bg-white border border-[#ECECF1] flex items-center justify-center text-[10px] font-semibold text-slate-600 shadow-2xs">
                      {step.stepNumber}
                    </span>
                    <code className="px-1.5 py-0.5 rounded-md bg-white border border-[#ECECF1] font-mono font-semibold text-slate-900 text-[11px]">
                      {step.toolName}
                    </code>
                    {step.durationMs !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {step.durationMs}ms
                      </span>
                    )}
                  </div>

                  <div>{getStatusBadge(step.status, step.retryCount)}</div>
                </div>

                {/* Model's Thought / Plan Note */}
                {step.thought && (
                  <p className="text-slate-600 text-[11px] mb-2 leading-relaxed italic bg-white/60 p-2 rounded-lg border border-slate-100">
                    "{step.thought}"
                  </p>
                )}

                {/* Error Banner */}
                {step.error && (
                  <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
                    {step.error}
                  </div>
                )}

                {/* Arguments & Result Toggle */}
                <button
                  type="button"
                  onClick={() => toggleExpand(step.id)}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <span>{isExpanded ? 'Hide Payload & Trace' : 'View Payload & Result'}</span>
                </button>

                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 space-y-2">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Arguments
                      </div>
                      <pre className="p-2 rounded-lg bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto">
                        {JSON.stringify(step.args, null, 2)}
                      </pre>
                    </div>

                    {step.result !== undefined && (
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                          Returned Data
                        </div>
                        <pre className="p-2 rounded-lg bg-slate-900 text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-40">
                          {JSON.stringify(step.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer running indicator */}
      {isRunning && (
        <div className="p-3 border-t border-[#ECECF1] bg-sky-50/50 flex items-center justify-between text-xs text-sky-800">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            Agent reasoning & invoking tools...
          </span>
        </div>
      )}
    </div>
  );
};
