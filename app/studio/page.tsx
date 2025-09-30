"use client";
import { useEffect, useState } from "react";

type Quote = { quote: string; start?: number; end?: number };

type Episode = { id: string; title: string; created_at: string };
type Summary = { summary_short?: string; summary_long?: string; topics?: string[]; quotes?: Quote[] };
type Posts = { linkedin: string; tweet_a: string; tweet_b: string };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      {children}
    </section>
  );
}
function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false), 1200); }}
      className="text-xs rounded border px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
    >
      {ok ? "Copied!" : "Copy"}
    </button>
  );
}

export default function Studio() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selected, setSelected] = useState<Episode | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [posts, setPosts] = useState<Posts | null>(null);
  const [busy, setBusy] = useState(false);

  async function fetchEpisodes() {
    const r = await fetch("/api/episodes"); // you can add a tiny list route or SSR
    if (r.ok) setEpisodes(await r.json());
  }
  useEffect(() => { fetchEpisodes(); }, []);

  async function upload() {
    if (!file) return setMsg("Pick a file");
    setMsg(""); setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title) fd.append("title", title);
      const r = await fetch("/api/transcribe", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Transcription failed");
      setMsg("Transcribed ✅");
      await fetchEpisodes();
    } catch (e:unknown) {
        setMsg(e instanceof Error ? e.message : "Unknown error");
    } finally { setBusy(false); }
  }

  async function doSummarize() {
    if (!selected) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/summarize", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ episode_id: selected.id })});
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || "Summarization failed"); setBusy(false); return; }
    setSummary(j.summary);
    setMsg("Summarized ✅");
    setBusy(false);
  }

  async function genSocial() {
    if (!selected) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/social", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ episode_id: selected.id })});
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || "Generation failed"); setBusy(false); return; }
    setPosts(j.posts);
    setMsg("Social drafts ready ✅");
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-6xl p-6 md:p-10 space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">RAG Studio — Podcast to Social</h1>
          <p className="text-sm text-gray-600 dark:text-neutral-400">Upload audio, get transcripts, summaries, and ready-to-post content.</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* Left: episodes & upload */}
        <div className="space-y-6">
          <Section title="Episodes">
            <ul className="space-y-2">
              {episodes.map(ep => (
                <li key={ep.id}
                    className={`cursor-pointer rounded-lg border p-3 text-sm dark:border-neutral-800 ${selected?.id===ep.id ? "bg-gray-50 dark:bg-neutral-900" : ""}`}
                    onClick={() => setSelected(ep)}>
                  <div className="font-medium">{ep.title}</div>
                  <div className="text-xs text-gray-500">{new Date(ep.created_at).toLocaleString()}</div>
                </li>
              ))}
              {episodes.length === 0 && <li className="text-sm text-gray-500">No episodes yet.</li>}
            </ul>
          </Section>

          <Section title="Upload audio">
            <div className="grid gap-3">
              <input type="file" accept="audio/*" onChange={(e)=>setFile(e.target.files?.[0] || null)}
                     className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-white hover:file:opacity-90 dark:file:bg-white dark:file:text-black" />
              <input className="rounded-lg border px-3 py-2 dark:border-neutral-800 dark:bg-neutral-900"
                     placeholder="Optional episode title"
                     value={title} onChange={e=>setTitle(e.target.value)} />
              <button onClick={upload} disabled={!file || busy}
                      className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black">
                {busy ? "Working…" : "Transcribe"}
              </button>
              {msg && <p className="text-sm">{msg}</p>}
            </div>
          </Section>
        </div>

        {/* Right: actions & outputs */}
        <div className="space-y-6">
          <Section title="Summaries & Insights">
            {!selected ? (
              <p className="text-sm text-gray-500">Select an episode to summarize.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button onClick={doSummarize} disabled={busy}
                          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black">
                    {busy ? "Summarizing…" : "Generate summary"}
                  </button>
                </div>

                {summary?.summary_short && (
                  <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong>Short Summary</strong> <Copy text={summary.summary_short} />
                    </div>
                    {summary.summary_short}
                  </div>
                )}
                {summary?.summary_long && (
                  <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong>Long Summary</strong> <Copy text={summary.summary_long} />
                    </div>
                    {summary.summary_long}
                  </div>
                )}
                {summary?.topics && summary.topics.length > 0 && (
                  <div className="text-sm">
                    <strong>Topics:</strong> {summary.topics.join(", ")}
                  </div>
                )}
              </div>
            )}
          </Section>

          <Section title="Social Posts">
            {!selected ? (
              <p className="text-sm text-gray-500">Select an episode to generate posts.</p>
            ) : (
              <div className="space-y-3">
                <button onClick={genSocial} disabled={busy}
                        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black">
                  {busy ? "Generating…" : "Generate drafts"}
                </button>

                {posts?.linkedin && (
                  <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong>LinkedIn</strong> <Copy text={posts.linkedin} />
                    </div>
                    {posts.linkedin}
                  </div>
                )}
                {posts?.tweet_a && (
                  <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong>Tweet A</strong> <Copy text={posts.tweet_a} />
                    </div>
                    {posts.tweet_a}
                  </div>
                )}
                {posts?.tweet_b && (
                  <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong>Tweet B</strong> <Copy text={posts.tweet_b} />
                    </div>
                    {posts.tweet_b}
                  </div>
                )}
              </div>
            )}
          </Section>
        </div>
      </div>

      <footer className="py-6 text-center text-xs text-gray-500 dark:text-neutral-500">
        Built by Nico Belazaras — Next.js · Supabase · OpenAI
      </footer>
    </main>
  );
}
