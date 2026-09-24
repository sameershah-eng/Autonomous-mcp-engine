import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  Trash2,
  Sparkles,
  FileText,
  Layers,
} from 'lucide-react';
import { useKnowledgeStore } from '../store/knowledgeStore';

export const KnowledgePage: React.FC = () => {
  const { documents, chunks, isProcessing, addDocument, deleteDocument, searchKnowledge } =
    useKnowledgeStore();
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docText.trim() || isProcessing) return;
    await addDocument(docTitle.trim(), docText.trim());
    setDocTitle('');
    setDocText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await addDocument(file.name.replace(/\.[^/.]+$/, ''), content);
      }
    };
    reader.readAsText(file);
  };

  const handleTestSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await searchKnowledge(searchQuery, 3);
      setSearchResults(res.chunks);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">
            Enterprise Knowledge & RAG Index
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Index enterprise policies and manuals into semantic vector chunks for autonomous retrieval by the agent.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Ingestion & Document List (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Ingest Box */}
            <div className="p-6 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 font-heading">
                  Index New Documentation
                </h3>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Upload .txt / .md</span>
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <form onSubmit={handleAddDoc} className="space-y-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g., SLA & Outage Credits Policy)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#ECECF1] bg-[#FAFAFB] outline-none focus:border-amber-400 text-slate-800"
                />

                <textarea
                  rows={4}
                  placeholder="Paste documentation text or policy clauses to chunk and embed..."
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-[#ECECF1] bg-[#FAFAFB] outline-none focus:border-amber-400 text-slate-800 leading-relaxed font-normal"
                />

                <button
                  type="submit"
                  disabled={isProcessing || !docTitle.trim() || !docText.trim()}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isProcessing ? 'Generating Vector Embeddings...' : 'Chunk & Store in RAG Index'}</span>
                </button>
              </form>
            </div>

            {/* Indexed Documents */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                Indexed Documents ({documents.length})
              </div>

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-white border border-[#ECECF1] card-shadow flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900 font-heading">
                      {doc.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {doc.chunkCount} semantic chunks · Indexed {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Search Tester & Chunks (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 font-heading">
                  Semantic Similarity Query Tester
                </h3>
                <p className="text-xs text-slate-500">
                  Tests the exact cosine similarity search executed by the agent's <code className="font-mono text-[11px]">knowledge_search</code> tool.
                </p>
              </div>

              <form onSubmit={handleTestSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Can support approve $400 refunds?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#ECECF1] bg-[#FAFAFB] outline-none focus:border-amber-400 text-slate-800"
                />
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B5B] to-[#FFB547] text-white font-semibold text-xs shadow-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Search Results */}
              {searchResults && (
                <div className="space-y-2 pt-2 border-t border-[#ECECF1]">
                  <div className="text-xs font-semibold text-slate-700">
                    Top Retrieved Chunks (Sorted by Cosine Similarity)
                  </div>
                  {searchResults.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 rounded-xl bg-[#FAFAFB] border border-[#ECECF1] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-800">{chk.docTitle}</span>
                        <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Sim: {chk.similarity}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {chk.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Chunks Breakdown */}
            <div className="p-5 rounded-2xl bg-white border border-[#ECECF1] card-shadow space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 font-heading">
                  Vector Memory Footprint
                </span>
                <span className="font-mono text-slate-500">
                  {chunks.length} total chunks in memory
                </span>
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Vector embeddings are generated using <code className="font-mono text-slate-700">gemini-embedding-2-preview</code> and stored in-browser for zero-latency retrieval.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
