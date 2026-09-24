import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAgentStore } from '../../store/agentStore';
import { runAgentLoop } from '../../lib/agent/agentLoop';
import { ApprovalCard } from './ApprovalCard';
import { SummaryCard } from './SummaryCard';

export const starterPrompts = [
  {
    title: 'Order Escalation',
    prompt: 'Find all pending orders from last week and open a high priority ticket for any over $500.',
    tools: 'PostgreSQL · Helpdesk',
  },
  {
    title: 'CRM Deal & Email',
    prompt: 'Search CRM for Marcus Brody, update deal stage to negotiation, and send a summary email.',
    tools: 'HubSpot · Gmail',
  },
  {
    title: 'Schedule & Weather',
    prompt: 'Find open meeting slots for tomorrow and check weather in San Francisco.',
    tools: 'Calendar · Weather (Retry test)',
  },
  {
    title: 'Knowledge Base RAG',
    prompt: 'Search our knowledge base for customer refund policies and summarize ticket thresholds.',
    tools: 'Vector Embeddings · Docs',
  },
];

export const ChatArea: React.FC = () => {
  const [input, setInput] = useState('');
  const {
    isRunning,
    messages,
    currentApproval,
    summary,
    tokenUsage,
    isStreaming,
    error,
    resetChat,
  } = useAgentStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentApproval, summary, isStreaming]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isRunning) return;
    const promptToSend = input.trim();
    setInput('');
    runAgentLoop(promptToSend);
  };

  const handleStarterClick = (prompt: string) => {
    if (isRunning) return;
    setInput('');
    runAgentLoop(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#ECECF1] card-shadow overflow-hidden">
      {/* Top Context & Token Bar */}
      <div className="px-5 py-3 border-b border-[#ECECF1] flex items-center justify-between bg-slate-50/50 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">Context Window:</span>
          <span>{messages.length}/20 messages active</span>
          <span className="text-slate-300">·</span>
          <span className="font-mono text-[11px] text-slate-600">
            {tokenUsage.totalTokens.toLocaleString()} tokens
          </span>
        </div>

        <button
          onClick={resetChat}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors text-[11px] font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear session</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto py-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B5B] to-[#FFB547] flex items-center justify-center text-white mb-4 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1 font-heading">
              Agent Automation Console
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Give autonomous instructions. Relay plans multi-step actions, invokes connected MCP tools, enforces human-in-the-loop approvals, and summarizes results.
            </p>

            {/* Clickable Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStarterClick(p.prompt)}
                  className="p-3 rounded-xl border border-[#ECECF1] hover:border-amber-300 hover:bg-amber-50/30 transition-all text-left group cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-amber-900 mb-1">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                    {p.prompt}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">
                    {p.tools}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                  {isUser ? 'User Instruction' : 'Relay Agent'}
                </div>
                <div
                  className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 border border-[#ECECF1] text-slate-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}

        {/* Human-In-The-Loop Approval Card if pending */}
        {currentApproval && <ApprovalCard request={currentApproval} />}

        {/* Structured Output Summary Card if finished */}
        {summary && <SummaryCard summary={summary} />}

        {/* Error notification */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Box Footer */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#ECECF1] bg-white">
        <div className="flex items-center gap-2 bg-slate-50 border border-[#ECECF1] rounded-2xl p-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
          <input
            type="text"
            placeholder="Instruct Relay (e.g. Find pending orders > $500 and create tickets)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isRunning}
            className="flex-1 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
          />
          <button
            type="submit"
            disabled={isRunning || !input.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B5B] to-[#FFB547] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:brightness-105 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span>Run</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
