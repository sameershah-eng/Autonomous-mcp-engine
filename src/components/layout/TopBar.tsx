import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface TopBarProps {
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommandPalette }) => {
  const { hasGeminiKey, setHasGeminiKey, activeProviderId, setActiveProviderId } = useSettingsStore();
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setHasGeminiKey(Boolean(data.hasKey));
        setIsCheckingKey(false);
      })
      .catch(() => {
        setHasGeminiKey(false);
        setIsCheckingKey(false);
      });
  }, [setHasGeminiKey]);

  return (
    <header className="h-16 border-b border-[#ECECF1] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Workspace selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#ECECF1] hover:bg-slate-50 cursor-pointer transition-colors text-sm font-medium text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Production Hub (us-east4)</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Engine status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 border-l border-[#ECECF1] pl-3">
          {activeProviderId === 'demo' ? (
            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Demo Simulation Mode Active
            </span>
          ) : hasGeminiKey ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Gemini 3.8 Flash Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium">
              <AlertCircle className="w-3 h-3 text-amber-500" />
              Simulated Autonomous Mode
            </span>
          )}
        </div>
      </div>

      {/* Right: Search / Command Palette and Mode Switch */}
      <div className="flex items-center gap-3">
        {/* Toggle Mode pill if no key is present */}
        {!hasGeminiKey && !isCheckingKey && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-[#ECECF1] px-3 py-1.5 rounded-xl">
            <span>Provider:</span>
            <button
              onClick={() => setActiveProviderId(activeProviderId === 'demo' ? 'gemini' : 'demo')}
              className="font-medium text-[#FF6B5B] hover:underline cursor-pointer"
            >
              {activeProviderId === 'demo' ? 'Switch to Gemini' : 'Switch to Demo'}
            </button>
          </div>
        )}

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 text-xs font-medium border border-transparent transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Quick actions & search</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-[#ECECF1] rounded-md shadow-2xs font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Quick Help / Docs */}
        <a
          href="#architecture"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '#architecture';
          }}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
        >
          Docs
        </a>
      </div>
    </header>
  );
};
