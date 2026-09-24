import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { KnowledgeChunk, KnowledgeDocument } from '../types/rag';
import { registerKnowledgeSearchHook } from '../lib/mcp/tools';
import { getProvider } from '../lib/llm/providerFactory';

interface KnowledgeState {
  documents: KnowledgeDocument[];
  chunks: KnowledgeChunk[];
  isProcessing: boolean;
  addDocument: (title: string, rawText: string) => Promise<void>;
  deleteDocument: (id: string) => void;
  searchKnowledge: (query: string, limit?: number) => Promise<{ query: string; totalChunksExamined: number; chunks: KnowledgeChunk[] }>;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function chunkText(text: string, title: string): Omit<KnowledgeChunk, 'embedding'>[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  return paragraphs.map((content, idx) => ({
    id: `chk_${Date.now()}_${idx}`,
    docTitle: title,
    content,
    charCount: content.length,
    createdAt: Date.now(),
  }));
}

const initialSeedDocs: { title: string; text: string }[] = [
  {
    title: 'Customer Refund and Escalation Policy',
    text: `All Relay SaaS subscriptions and agent seats carry an unconditional 30-day money-back guarantee for first-time signups.
    Tier 1 Support Specialists may directly issue credit card refunds up to $500 via Stripe without manager approval.
    Refunds between $501 and $2,500 require Team Lead sign-off within 2 business days.
    Amounts exceeding $2,500 must receive written authorization from the Director of Finance.
    Custom AI fine-tuning compute allocations and dedicated agent sandboxes are strictly non-refundable once compute hours have started.`,
  },
  {
    title: 'Relay Enterprise Architecture & SLAs',
    text: `Relay guarantees 99.95% multi-region agent loop availability for enterprise commitments.
    In the event of an SLA breach between 99.0% and 99.94%, an automatic 10% invoice credit is credited to the billing account.
    If availability drops below 99.0%, a 30% monthly invoice credit is applied.
    All MCP tool calls are secured with mutual TLS and validated against runtime Zod JSON schemas before invocation.`,
  },
];

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      documents: [],
      chunks: [],
      isProcessing: false,

      addDocument: async (title, rawText) => {
        set({ isProcessing: true });
        try {
          const rawChunks = chunkText(rawText, title);
          const provider = getProvider('gemini');
          const isConfigured = await provider.isConfigured();
          const activeProvider = isConfigured ? provider : getProvider('demo');

          const processedChunks: KnowledgeChunk[] = [];
          for (const c of rawChunks) {
            let embedding: number[] = [];
            try {
              if (activeProvider.embed) {
                embedding = await activeProvider.embed(c.content);
              }
            } catch {
              // fallback to demo embedder
              const demo = getProvider('demo');
              if (demo.embed) embedding = await demo.embed(c.content);
            }
            processedChunks.push({ ...c, embedding });
          }

          const docId = `doc_${Date.now()}`;
          const newDoc: KnowledgeDocument = {
            id: docId,
            title,
            chunkCount: processedChunks.length,
            uploadedAt: Date.now(),
            content: rawText,
          };

          set((state) => ({
            documents: [newDoc, ...state.documents],
            chunks: [...processedChunks, ...state.chunks],
            isProcessing: false,
          }));
        } catch {
          set({ isProcessing: false });
        }
      },

      deleteDocument: (id) =>
        set((state) => {
          const doc = state.documents.find((d) => d.id === id);
          if (!doc) return state;
          return {
            documents: state.documents.filter((d) => d.id !== id),
            chunks: state.chunks.filter((c) => c.docTitle !== doc.title),
          };
        }),

      searchKnowledge: async (query, limit = 3) => {
        const provider = getProvider('gemini');
        const isConfigured = await provider.isConfigured();
        const activeProvider = isConfigured ? provider : getProvider('demo');

        let queryVec: number[] = [];
        try {
          if (activeProvider.embed) {
            queryVec = await activeProvider.embed(query);
          }
        } catch {
          const demo = getProvider('demo');
          if (demo.embed) queryVec = await demo.embed(query);
        }

        const scored = get().chunks.map((chunk) => {
          const sim = chunk.embedding && queryVec.length > 0
            ? cosineSimilarity(queryVec, chunk.embedding)
            : chunk.content.toLowerCase().includes(query.toLowerCase()) ? 0.75 : 0.1;
          return { ...chunk, similarity: Number(sim.toFixed(3)) };
        });

        scored.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

        return {
          query,
          totalChunksExamined: get().chunks.length,
          chunks: scored.slice(0, limit),
        };
      },
    }),
    {
      name: 'relay_knowledge_v1',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Register RAG hook with the MCP tool
          registerKnowledgeSearchHook(async (query: string, limit?: number) => {
            const result = await state.searchKnowledge(query, limit);
            return {
              query,
              retrievedCount: result.chunks.length,
              chunks: result.chunks.map((c) => ({
                id: c.id,
                title: c.docTitle,
                snippet: c.content,
                similarity: c.similarity,
              })),
            };
          });

          // Seed default documents if empty
          if (state.documents.length === 0) {
            for (const doc of initialSeedDocs) {
              state.addDocument(doc.title, doc.text);
            }
          }
        }
      },
    }
  )
);
