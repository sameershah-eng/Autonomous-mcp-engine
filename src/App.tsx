import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ConsolePage } from './pages/ConsolePage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { ToolsPage } from './pages/ToolsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { RunsPage } from './pages/RunsPage';
import { KnowledgePage } from './pages/KnowledgePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAFB] text-slate-800 font-sans antialiased">
        {/* Slim Left Navigation */}
        <Sidebar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
          <TopBar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <Routes>
              <Route path="/" element={<ConsolePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workflows" element={<WorkflowsPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/runs" element={<RunsPage />} />
              <Route path="/knowledge" element={<KnowledgePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>

        {/* Global Command Palette (Cmd + K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
