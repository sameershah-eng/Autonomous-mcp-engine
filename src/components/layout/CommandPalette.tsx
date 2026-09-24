import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Terminal,
  LayoutDashboard,
  Workflow,
  Wrench,
  Layers,
  ListRestart,
  BookOpen,
  Settings,
  Play,
  ArrowRight,
} from 'lucide-react';
import { runAgentLoop } from '../../lib/agent/agentLoop';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'p_console', title: 'Go to Console', desc: 'Main autonomous chat workspace', icon: Terminal, action: () => navigate('/') },
    { id: 'p_dashboard', title: 'Go to Dashboard', desc: 'Real-time telemetry and KPI metrics', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'p_workflows', title: 'Go to Workflows', desc: 'Visual pipeline builder and automations', icon: Workflow, action: () => navigate('/workflows') },
    { id: 'p_tools', title: 'Go to MCP Tools', desc: 'Inspect registered tools and test schemas', icon: Wrench, action: () => navigate('/tools') },
    { id: 'p_integrations', title: 'Go to Integrations', desc: 'Manage CRM, DB, and communication credentials', icon: Layers, action: () => navigate('/integrations') },
    { id: 'p_runs', title: 'Go to Runs & Traces', desc: 'Audit log table with timeline replays', icon: ListRestart, action: () => navigate('/runs') },
    { id: 'p_knowledge', title: 'Go to Knowledge Base', desc: 'Upload documents and test semantic RAG vectors', icon: BookOpen, action: () => navigate('/knowledge') },
    { id: 'p_settings', title: 'Go to Settings', desc: 'Model parameters and approval policies', icon: Settings, action: () => navigate('/settings') },
    {
      id: 'act_orders',
      title: 'Run: Order Escalation Audit',
      desc: 'Query pending orders >$500 and create tickets',
      icon: Play,
      action: () => {
        navigate('/');
        runAgentLoop('Find all pending orders from last week and open a high priority ticket for any over $500.');
      },
    },
    {
      id: 'act_crm',
      title: 'Run: Marcus Brody Deal Update',
      desc: 'Advance pipeline and dispatch email',
      icon: Play,
      action: () => {
        navigate('/');
        runAgentLoop('Search CRM for Marcus Brody, update deal stage to negotiation, and send a summary email.');
      },
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#ECECF1] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="p-3.5 border-b border-[#ECECF1] flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
          />
          <kbd
            onClick={onClose}
            className="px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded-md border border-slate-200 cursor-pointer"
          >
            ESC
          </kbd>
        </div>

        {/* Action list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#FF6B5B]/10 group-hover:text-[#FF6B5B] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-400 font-normal">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6B5B] group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
