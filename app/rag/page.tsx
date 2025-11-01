"use client";

import { useState } from "react";
import type {
  MatchChunk,
  RagApiResponse,
  UploadApiResponse,
} from "@/types/rag";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const fmtMB = (b: number) => `${(b / (1024 * 1024)).toFixed(2)} MB`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs relative inline-flex items-center justify-center rounded-xl px-3 py-2 font-medium text-white 
bg-black border border-transparent 
[background:linear-gradient(#0B0B0C,#0B0B0C)_padding-box,linear-gradient(to_right,var(--color-accent-purple),var(--color-accent-blue))_border-box]
hover:opacity-90 transition hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Home() {
  // Q&A state
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<MatchChunk[]>([]);
  const [msg, setMsg] = useState("");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docId, setDocId] = useState("");

  function pick(f?: File) {
    setMsg("");
    if (!f) return setFile(null);
    if (f.size > MAX_FILE_BYTES) {
      setFile(null);
      setMsg(`File too large: ${fmtMB(f.size)} (max ${fmtMB(MAX_FILE_BYTES)})`);
      return;
    }
    setFile(f);
  }

  async function ask() {
    setLoading(true);
    setMsg("");
    setAnswer("");
    setSources([]);
    try {
      const res = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json: RagApiResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Error");
      setAnswer(json.answer);
      setSources(json.sources || []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function upload() {
    setMsg("");
    if (!file) return setMsg("Please choose a file.");
    if (file.size > MAX_FILE_BYTES)
      return setMsg(
        `File too large: ${fmtMB(file.size)} (max ${fmtMB(MAX_FILE_BYTES)})`,
      );

    const fd = new FormData();
    fd.append("file", file);
    if (title) fd.append("title", title);
    if (docId) fd.append("doc_id", docId);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json: UploadApiResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setMsg(json.message || "Uploaded and ingested successfully.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unknown error");
    }
  }

  const topSim = sources[0]?.similarity ?? 0;

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-12 space-y-10">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full blur-[120px] opacity-10 gradient-bg" />
      </div>

      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            <span className="gradient-text">RAG Studio</span>
          </h1>
          <p className="text-white/70">
            Upload documents, ask questions, and get grounded answers with cited
            sources.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            pgvector
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            Next.js
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            OpenAI
          </span>
        </div>
      </header>

      {/* Ask Card */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.15)]">
        <h2 className="text-lg font-medium mb-3">Ask a question</h2>

        <div className="space-y-3">
          <textarea
            className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 leading-relaxed outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/40"
            rows={4}
            placeholder="e.g., Why was HMS Belfast important in WW2?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={ask}
              disabled={loading || !q}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white button-glow
                     disabled:opacity-50 bg-gradient-to-r from-accent-purple to-accent-blue"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  Thinking…
                </>
              ) : (
                "Ask"
              )}
            </button>

            {sources.length > 0 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Confidence: {topSim.toFixed(2)}
              </span>
            )}

            {answer && <CopyButton text={answer} />}
          </div>
        </div>

        {/* Answer */}
        {answer && (
          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Answer</h3>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed text-white/90">
              {answer}
            </div>

            {/* Sources */}
            {sources?.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-white/80">
                  Sources
                </h4>
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li
                      key={`${s.id}-${s.chunk_index}`}
                      className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm"
                    >
                      <details>
                        <summary className="cursor-pointer">
                          [{s.title ?? "doc"}#{s.chunk_index}] • similarity{" "}
                          {s.similarity.toFixed(3)}
                        </summary>
                        <p className="mt-2 text-white/80">
                          {s.text.slice(0, 500)}
                          {s.text.length > 500 ? "…" : ""}
                        </p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {msg && !answer && <p className="mt-3 text-sm text-red-400">{msg}</p>}
      </section>

      {/* Upload Card */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.15)]">
        <h2 className="text-lg font-medium mb-3">Upload & re-ingest</h2>

        <div className="grid gap-3">
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={(e) => pick(e.target.files?.[0] || undefined)}
            className="block w-full text-sm file:mr-4 file:rounded-xl file:border file:border-white/10 file:bg-white/5 file:px-4 file:py-2 file:text-white hover:file:bg-white/10"
          />
          {file && (
            <div className="text-sm text-white/70">
              Selected: <strong className="text-white/90">{file.name}</strong> —{" "}
              {fmtMB(file.size)}
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 placeholder:text-white/40"
              placeholder="Optional title override"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 placeholder:text-white/40"
              placeholder="Optional doc_id (for filtering)"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center rounded-xl px-5 py-3 font-medium text-white button-glow
                     bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-95 disabled:opacity-50"
              onClick={upload}
              disabled={!file}
            >
              Upload & Ingest
            </button>
            <p className="text-xs text-white/60">
              Max file size: {fmtMB(MAX_FILE_BYTES)} • Supports .txt, .md, .pdf
            </p>
          </div>
          {msg && <p className="text-sm text-white/80">{msg}</p>}
        </div>
      </section>
    </main>
  );
}
