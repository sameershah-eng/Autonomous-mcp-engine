import React from 'react';
import { CheckCircle2, ArrowRightCircle, Sparkles } from 'lucide-react';
import type { AgentSummary } from '../../types/agent';

interface SummaryCardProps {
  summary: AgentSummary;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  return (
    <div className="my-5 p-5 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ECECF1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 font-heading">
            Executive Execution Summary
          </h4>
        </div>
        <span className="text-[11px] text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
          Structured Output · Verified Schema
        </span>
      </div>

      {/* Main summary text */}
      <p className="text-xs text-slate-700 leading-relaxed font-normal">
        {summary.summary}
      </p>

      {/* Actions Taken */}
      {summary.actionsTaken && summary.actionsTaken.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Actions Executed
          </div>
          <div className="space-y-1.5">
            {summary.actionsTaken.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Follow-ups */}
      {summary.followUps && summary.followUps.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Recommended Follow-Ups
          </div>
          <div className="space-y-1.5">
            {summary.followUps.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                <ArrowRightCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
