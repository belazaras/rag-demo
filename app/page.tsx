"use client";

import { useState } from "react";
import type { MatchChunk, RagApiResponse, UploadApiResponse } from "@/types/rag";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const fmtMB = (b: number) => `${(b / (1024 * 1024)).toFixed(2)} MB`;

function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "green" | "red" }) {
  const tones: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300",
    green: "bg-green-100 text-green-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="text-xs rounded border px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
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
    if (file.size > MAX_FILE_BYTES) return setMsg(`File too large: ${fmtMB(file.size)} (max ${fmtMB(MAX_FILE_BYTES)})`);

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
  const simTone = topSim >= 0.75 ? "green" : topSim >= 0.65 ? "gray" : "red";

  return (
    <main className="mx-auto max-w-4xl p-6 md:p-10 space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">RAG Studio</h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            Upload documents, ask questions, and get grounded answers with cited sources.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Badge>pgvector</Badge>
          <Badge>Next.js</Badge>
          <Badge>OpenAI</Badge>
        </div>
      </header>

      {/* Ask Card */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-lg font-medium mb-3">Ask a question</h2>
        <div className="space-y-3">
          <textarea
            className="w-full resize-y rounded-lg border px-3 py-2 leading-relaxed outline-none focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
            rows={4}
            placeholder="e.g., What advantages does Shopify offer in these docs?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={ask}
              disabled={loading || !q}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent dark:border-black/60 dark:border-t-transparent" />{" "}
                  Thinking…
                </>
              ) : (
                "Ask"
              )}
            </button>
            {sources.length > 0 && (
              <Badge tone={simTone as any}>Confidence: {topSim.toFixed(2)}</Badge>
            )}
            {answer && <CopyButton text={answer} />}
          </div>
        </div>

        {/* Answer */}
        {answer && (
          <div className="mt-5 rounded-xl border bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Answer</h3>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>

            {/* Sources */}
            {sources?.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-neutral-300">Sources</h4>
                <ul className="space-y-2">
                  {sources.map((s) => (
                    <li key={`${s.id}-${s.chunk_index}`} className="rounded-lg border p-3 text-sm dark:border-neutral-800">
                      <details>
                        <summary className="cursor-pointer">
                          [{s.title ?? "doc"}#{s.chunk_index}] • similarity {s.similarity.toFixed(3)}
                        </summary>
                        <p className="mt-2 opacity-90">{s.text.slice(0, 500)}{s.text.length > 500 ? "…" : ""}</p>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {msg && !answer && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{msg}</p>
        )}
      </section>

      {/* Upload Card */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h2 className="text-lg font-medium mb-3">Upload & re-ingest</h2>
        <div className="grid gap-3">
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={(e) => pick(e.target.files?.[0] || undefined)}
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white hover:file:opacity-90 dark:file:bg-white dark:file:text-black"
          />
          {file && (
            <div className="text-sm text-gray-600 dark:text-neutral-400">
              Selected: <strong>{file.name}</strong> — {fmtMB(file.size)}
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-lg border px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900"
              placeholder="Optional title override"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="rounded-lg border px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900"
              placeholder="Optional doc_id (for filtering)"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
              onClick={upload}
              disabled={!file}
            >
              Upload & Ingest
            </button>
            <p className="text-xs text-gray-500 dark:text-neutral-500">
              Max file size: {fmtMB(MAX_FILE_BYTES)} • Supports .txt, .md, .pdf
            </p>
          </div>
          {msg && <p className="text-sm">{msg}</p>}
        </div>
      </section>

      <footer className="py-6 text-center text-xs text-gray-500 dark:text-neutral-500">
        Built by <b>Nico Belazaras</b> with Next.js · Supabase (pgvector) · OpenAI
      </footer>
    </main>
  );
}
