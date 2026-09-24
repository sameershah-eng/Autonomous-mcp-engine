import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sliders,
  X,
  Key,
} from 'lucide-react';
import { useIntegrationsStore } from '../store/integrationsStore';
import type { Integration } from '../types/integrations';

export const IntegrationsPage: React.FC = () => {
  const { integrations, toggleConnected, toggleToolPermission } = useIntegrationsStore();
  const [modalIntegration, setModalIntegration] = useState<Integration | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleOpenConnect = (integration: Integration) => {
    setModalIntegration(integration);
    setApiKeyInput('');
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalIntegration) return;
    toggleConnected(modalIntegration.id, true);
    setModalIntegration(null);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Connected Integrations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise data bridges, communication gateways, and per-integration tool permission controls.
          </p>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-[#ECECF1] card-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-[#ECECF1] flex items-center justify-center text-slate-700 font-semibold text-sm">
                    {item.name.slice(0, 2).toUpperCase()}
                  </div>

                  {item.connected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-slate-900 font-heading">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Tool permissions switches if connected */}
              {item.connected && item.allowedTools.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3" />
                    <span>Enabled MCP Tools</span>
                  </div>
                  <div className="space-y-1">
                    {item.allowedTools.map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <code className="text-[11px] font-mono text-slate-700">
                          {tool}
                        </code>
                        <input
                          type="checkbox"
                          checked={item.allowedTools.includes(tool)}
                          onChange={() => toggleToolPermission(item.id, tool)}
                          className="rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connect / Disconnect Action */}
              <div className="pt-2 flex items-center justify-between">
                {item.connected ? (
                  <button
                    onClick={() => toggleConnected(item.id, false)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenConnect(item)}
                    className="w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Connect Service
                  </button>
                )}

                {item.docsUrl && (
                  <a
                    href={item.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-600 ml-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connect Modal */}
      {modalIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#ECECF1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 font-heading">
                  Connect {modalIntegration.name}
                </h3>
              </div>
              <button
                onClick={() => setModalIntegration(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter your integration access credentials or simulated sandbox secret token.
            </p>

            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  API Key / Access Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="sk_live_••••••••••••••••••••"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECECF1] bg-slate-50 outline-none focus:border-amber-400 text-slate-800"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalIntegration(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6B5B] to-[#FFB547] text-white text-xs font-semibold hover:brightness-105 transition-all cursor-pointer"
                >
                  Confirm & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
