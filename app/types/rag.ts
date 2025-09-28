// types/rag.ts
export interface MatchChunk {
  id: number;
  doc_id: string;
  title: string | null;
  source: string | null;
  chunk_index: number;
  text: string;
  similarity: number; // 0..1 (higher is better)
}

export interface RagApiRequest {
  question: string;
  topK?: number;
  minScore?: number;
}

export interface RagApiResponse {
  answer: string;
  sources: MatchChunk[];
  confidence: number; // top similarity
  error?: string;
}

export interface UploadApiResponse {
  ok: boolean;
  doc_id: string;
  title: string;
  chunks: number;
  inserted: number;
  message: string;
  error?: string;
}
