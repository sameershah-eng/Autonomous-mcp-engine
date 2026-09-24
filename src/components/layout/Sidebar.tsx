import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Terminal,
  LayoutDashboard,
  Workflow,
  Wrench,
  Layers,
  ListRestart,
  BookOpen,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  onOpenCommandPalette: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/', label: 'Console', icon: Terminal, end: true },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/workflows', label: 'Workflows', icon: Workflow },
    { to: '/tools', label: 'MCP Tools', icon: Wrench },
    { to: '/integrations', label: 'Integrations', icon: Layers },
    { to: '/runs', label: 'Runs & Traces', icon: ListRestart },
    { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#ECECF1] bg-[#FAFAFB] flex flex-col justify-between h-screen shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#ECECF1]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF6B5B] to-[#FFB547] flex items-center justify-center text-white shadow-sm font-semibold tracking-tight">
            R
          </div>
          <div>
            <div className="font-semibold text-slate-900 tracking-tight text-base leading-tight font-heading">
              Relay
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Autonomous MCP Engine
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 font-semibold shadow-xs border border-[#ECECF1]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1 rounded-md transition-colors ${
                        isActive
                          ? 'text-[#FF6B5B] bg-[#FF6B5B]/10'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#FF6B5B] to-[#FFB547]" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account Presence */}
      <div className="p-3 border-t border-[#ECECF1]">
        <div className="p-3 rounded-xl bg-white border border-[#ECECF1] card-shadow">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-semibold text-slate-900">Acme Cloud Org</span>
            <span className="inline-flex items-center text-[10px] font-medium text-emerald-600">
              <ShieldCheck className="w-3 h-3 mr-0.5" /> mTLS
            </span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            mcp://in-memory.local:3000
          </div>
        </div>
      </div>
    </aside>
  );
};
