import React from 'react';
import { useAgentStore } from '../store/agentStore';
import { ChatArea } from '../components/agent/ChatArea';
import { Timeline } from '../components/agent/Timeline';

export const ConsolePage: React.FC = () => {
  const { steps, isRunning } = useAgentStore();

  return (
    <div className="relative flex-1 flex flex-col p-6 h-[calc(100vh-4rem)] overflow-hidden">
      {/* Subtle top-right gradient mesh as requested */}
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FFB547]/10 via-[#FF6B5B]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Main Workspace Split */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        {/* Left: Chat workspace (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col min-h-0">
          <ChatArea />
        </div>

        {/* Right: Execution timeline (5 cols) */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0">
          <Timeline steps={steps} isRunning={isRunning} />
        </div>
      </div>
    </div>
  );
};
