import React, { useState } from 'react';
import {
  Wrench,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Shield,
  Layers,
} from 'lucide-react';
import { mcpTools } from '../lib/mcp/tools';
import { mcpServer } from '../lib/mcp/server';
import type { MCPTool } from '../types/mcp';

export const ToolsPage: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<MCPTool>(mcpTools[0]);
  const [testArgs, setTestArgs] = useState<Record<string, any>>(() => {
    // initialize defaults
    const initial: Record<string, any> = {};
    const props = mcpTools[0]?.inputSchema.properties || {};
    for (const key of Object.keys(props)) {
      if (props[key].enum) initial[key] = props[key].enum[0];
      else if (props[key].type === 'number') initial[key] = 5;
      else initial[key] = key === 'query' ? 'Sarah' : key === 'city' ? 'San Francisco' : 'test';
    }
    return initial;
  });
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSelectTool = (tool: MCPTool) => {
    setSelectedTool(tool);
    setTestResult(null);
    const initial: Record<string, any> = {};
    const props = tool.inputSchema.properties || {};
    for (const key of Object.keys(props)) {
      if (props[key].enum) initial[key] = props[key].enum[0];
      else if (props[key].type === 'number') initial[key] = key === 'limit' ? 5 : 45;
      else if (key === 'query') initial[key] = 'Marcus';
      else if (key === 'to') initial[key] = 'sarah.chen@acmeholdings.com';
      else if (key === 'city') initial[key] = 'San Francisco';
      else if (key === 'date') initial[key] = 'tomorrow';
      else if (key === 'dealId') initial[key] = 'cnt_101';
      else if (key === 'customerId') initial[key] = 'cnt_101';
      else if (key === 'title') initial[key] = 'System Performance Investigation';
      else initial[key] = '';
    }
    setTestArgs(initial);
  };

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    setTestResult(null);
    try {
      const res = await mcpServer.callTool(selectedTool.name, testArgs);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, error: err?.message || String(err) });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            MCP Tool Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulated in-browser Model Context Protocol tools adhering to the standard MCP specification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tool Directory (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Registered Tools ({mcpTools.length})
            </div>

            {mcpTools.map((tool) => {
              const isSelected = tool.name === selectedTool.name;
              return (
                <div
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#FF6B5B] card-shadow ring-1 ring-[#FF6B5B]/20'
                      : 'bg-white/80 border-[#ECECF1] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <code className="text-xs font-bold font-mono text-slate-900">
                      {tool.name}
                    </code>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        tool.permission === 'read'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : tool.permission === 'write'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {tool.permission}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Tool Inspector & Test Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#ECECF1] card-shadow p-6 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#ECECF1]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold font-mono text-slate-900">
                    {selectedTool.name}
                  </h2>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {selectedTool.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedTool.description}
                </p>
              </div>
            </div>

            {/* Auto-Generated Form from JSON Schema */}
            <form onSubmit={handleRunTest} className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                <span>Test Tool with Direct Parameters</span>
              </div>

              <div className="space-y-3 bg-[#FAFAFB] p-4 rounded-xl border border-[#ECECF1]">
                {Object.entries(selectedTool.inputSchema.properties).map(([key, prop]) => {
                  const isRequired = selectedTool.inputSchema.required?.includes(key);

                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-mono font-medium text-slate-800">
                          {key} {isRequired && <span className="text-rose-500">*</span>}
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prop.type}
                        </span>
                      </div>

                      {prop.enum ? (
                        <select
                          value={testArgs[key] || ''}
                          onChange={(e) =>
                            setTestArgs({ ...testArgs, [key]: e.target.value })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-[#ECECF1] bg-white outline-none focus:border-amber-400 text-slate-800"
                        >
                          {prop.enum.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : prop.type === 'number' ? (
                        <input
                          type="number"
                          value={testArgs[key] ?? ''}
                          onChange={(e) =>
                            setTestArgs({ ...testArgs, [key]: Number(e.target.value) })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-[#ECECF1] bg-white outline-none focus:border-amber-400 text-slate-800"
                        />
                      ) : (
                        <input
                          type="text"
                          value={testArgs[key] || ''}
                          placeholder={prop.description || key}
                          onChange={(e) =>
                            setTestArgs({ ...testArgs, [key]: e.target.value })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-[#ECECF1] bg-white outline-none focus:border-amber-400 text-slate-800"
                        />
                      )}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={isExecuting}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Calling Tool...' : 'Execute Tool Call'}</span>
                </button>
              </div>
            </form>

            {/* Test Results Output */}
            {testResult && (
              <div className="space-y-2 pt-2 border-t border-[#ECECF1]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Response Payload</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {testResult.durationMs ? `${testResult.durationMs}ms` : ''}
                  </span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
