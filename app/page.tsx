"use client";
import { useState } from "react";
import type { MatchChunk, RagApiResponse, UploadApiResponse } from "@/types/rag";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

function formatBytes(b: number) {
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Home() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<MatchChunk[]>([]);
  const [err, setErr] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docId, setDocId] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    setLoading(true); setErr(""); setAnswer(""); setSources([]);
    try {
      const r = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, topK: 4, minScore: 0.0 }),
      });
      const json: RagApiResponse = await r.json();
      if (!r.ok) throw new Error(json.error || "Error");
      setAnswer(json.answer);
      setSources(json.sources || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function onPick(f?: File) {
    setMsg("");
    if (!f) { setFile(null); return; }
    if (f.size > MAX_FILE_BYTES) {
      setFile(null);
      setMsg(`File too large: ${formatBytes(f.size)} (max ${formatBytes(MAX_FILE_BYTES)})`);
      return;
    }
    setFile(f);
  }

  async function upload() {
    setMsg("");
    if (!file) { setMsg("Please choose a file."); return; }
    if (file.size > MAX_FILE_BYTES) {
      setMsg(`File too large: ${formatBytes(file.size)} (max ${formatBytes(MAX_FILE_BYTES)})`);
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title) fd.append("title", title);
      if (docId) fd.append("doc_id", docId);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json: UploadApiResponse = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setMsg(json.message || "Uploaded and ingested successfully.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">RAG Demo</h1>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Ask a question…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={ask} disabled={loading || !q}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
          {loading ? "Thinking…" : "Ask"}
        </button>
      </div>

      {err && <p className="text-red-600 mt-3">{err}</p>}

      {answer && (
        <section className="mt-6">
          <h2 className="font-semibold">Answer</h2>
          <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded mt-2">{answer}</pre>

          {sources?.length > 0 && (
            <>
              <div className="text-sm text-gray-500 mt-2">
                Confidence: {(sources[0]?.similarity ?? 0).toFixed(2)}
              </div>
              <h3 className="font-semibold mt-4">Sources</h3>
              <ul className="space-y-2 mt-2">
                {sources.map((s, i) => (
                  <li key={i} className="text-sm">
                    [{s.title}#{s.chunk_index}] {String(s.text).slice(0, 180)}…
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <section className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Upload & Re-ingest</h2>
        <div className="grid gap-3">
          <input
            type="file"
            accept=".txt,.md,.pdf"
            onChange={(e) => onPick(e.target.files?.[0] || undefined)}
          />

          {file && (
            <div className="text-sm text-gray-600">
              Selected: <strong>{file.name}</strong> — {formatBytes(file.size)}
            </div>
          )}

          <input
            className="border rounded px-3 py-2"
            placeholder="Optional title override"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Optional doc_id (for filtering)"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          />

          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            onClick={upload}
            disabled={busy || !file}
            title={file && file.size > MAX_FILE_BYTES ? "File too large" : undefined}
          >
            {busy ? "Uploading…" : "Upload & Ingest"}
          </button>

          {msg && <p className="text-sm">{msg}</p>}
          <p className="text-xs text-gray-500">
            Max file size: {formatBytes(MAX_FILE_BYTES)}. Supported: .txt, .md, .pdf
          </p>
        </div>
      </section>
    </main>
  );
}
