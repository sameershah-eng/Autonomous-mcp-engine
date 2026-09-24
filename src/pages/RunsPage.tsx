import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  X,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { useHistoryStore } from '../store/historyStore';
import type { AgentRun } from '../types/agent';

export const RunsPage: React.FC = () => {
  const { runs } = useHistoryStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'failed'>('all');
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);

  const filteredRuns = runs.filter((r) => {
    const matchesSearch =
      r.instruction.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.steps.some((s) => s.toolName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Execution Logs & Traces
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of all autonomous runs, tool inputs, latency benchmarks, and retry events.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search instructions or tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#ECECF1] bg-white outline-none focus:border-amber-400 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['all', 'completed', 'failed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Runs Table */}
        <div className="bg-white rounded-2xl border border-[#ECECF1] card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFB] border-b border-[#ECECF1] text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Instruction</th>
                  <th className="py-3 px-4">Tools Invocations</th>
                  <th className="py-3 px-4">Steps</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Retries</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECF1]">
                {filteredRuns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching execution runs found.
                    </td>
                  </tr>
                ) : (
                  filteredRuns.map((r) => {
                    const uniqueTools = Array.from(new Set(r.steps.map((s) => s.toolName)));
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRun(r)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-900">
                          {r.instruction}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {uniqueTools.map((t) => (
                              <code
                                key={t}
                                className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700"
                              >
                                {t}
                              </code>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {r.steps.length}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {r.durationMs || 1200}ms
                        </td>
                        <td className="py-3 px-4">
                          {r.retriesTotal > 0 ? (
                            <span className="text-amber-700 font-mono text-[11px] font-semibold">
                              {r.retriesTotal}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">0</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {r.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRun(r);
                            }}
                            className="text-amber-600 hover:text-amber-700 font-medium cursor-pointer"
                          >
                            Replay
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Replay Drawer */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-[#ECECF1] flex flex-col justify-between overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#ECECF1] flex items-start justify-between">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase">
                  Execution Trace · {selectedRun.id}
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-heading mt-1 leading-snug">
                  {selectedRun.instruction}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Flow Replay */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Timeline Replay ({selectedRun.steps.length} Steps)
              </div>

              {selectedRun.steps.map((st, idx) => (
                <div
                  key={st.id || idx}
                  className="p-3.5 rounded-xl border border-[#ECECF1] bg-[#FAFAFB] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white border border-[#ECECF1] flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <code className="font-mono font-semibold text-slate-900">
                        {st.toolName}
                      </code>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {st.durationMs}ms
                    </span>
                  </div>

                  {st.thought && (
                    <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                      "{st.thought}"
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">
                      Input Arguments
                    </div>
                    <pre className="p-2 rounded bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto">
                      {JSON.stringify(st.args, null, 2)}
                    </pre>
                  </div>

                  {st.result !== undefined && (
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">
                        Output Data
                      </div>
                      <pre className="p-2 rounded bg-slate-900 text-emerald-400 text-[10px] font-mono overflow-x-auto max-h-32">
                        {JSON.stringify(st.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#ECECF1] bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Status: <strong className="text-slate-800 capitalize">{selectedRun.status}</strong></span>
              <button
                onClick={() => setSelectedRun(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
