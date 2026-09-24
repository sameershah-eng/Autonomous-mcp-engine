export interface KnowledgeChunk {
  id: string;
  docTitle: string;
  content: string;
  embedding?: number[];
  similarity?: number;
  charCount: number;
  createdAt: number;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  chunkCount: number;
  uploadedAt: number;
  content: string;
}
