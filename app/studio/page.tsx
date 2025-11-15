"use client";

import { useEffect, useState } from "react";

type Quote = { quote: string; start?: number; end?: number };

type Episode = { id: string; title: string; created_at: string };
type Summary = {
  summary_short?: string;
  summary_long?: string;
  topics?: string[];
  quotes?: Quote[];
};
type Posts = { linkedin: string; tweet_a: string; tweet_b: string };

type SummaryResponse = { summary: Summary | null };
type SocialResponse = { posts: Posts | null };

// Gradient Copy button (same style as RAG page)
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

function CardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.15)] space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-white">{title}</h2>
        {description && <p className="text-xs text-white/60">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function Studio() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selected, setSelected] = useState<Episode | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [posts, setPosts] = useState<Posts | null>(null);

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [isLoadingEpisodeData, setIsLoadingEpisodeData] = useState(false);

  // Separate messages
  const [uploadMsg, setUploadMsg] = useState("");
  const [summaryMsg, setSummaryMsg] = useState("");
  const [socialMsg, setSocialMsg] = useState("");

  async function fetchEpisodes() {
    const r = await fetch("/api/episodes");
    if (r.ok) {
      const data: Episode[] = await r.json();
      setEpisodes(data);
    }
  }

  useEffect(() => {
    fetchEpisodes();
  }, []);

  // When clicking an episode, load existing summary + social if present
  async function handleSelectEpisode(ep: Episode) {
    setSelected(ep);
    setSummary(null);
    setPosts(null);
    setSummaryMsg("");
    setSocialMsg("");
    setIsLoadingEpisodeData(true);

    try {
      const [summaryRes, socialRes] = await Promise.all([
        fetch(`/api/summarize?episode_id=${ep.id}`),
        fetch(`/api/social?episode_id=${ep.id}`),
      ]);

      if (summaryRes.ok) {
        const sj: SummaryResponse = await summaryRes.json();
        setSummary(sj.summary ?? null);
      }

      if (socialRes.ok) {
        const pj: SocialResponse = await socialRes.json();
        setPosts(pj.posts ?? null);
      }
    } catch (e) {
      console.error("Failed to load episode data", e);
      // optional: setSummaryMsg("Failed to load saved data.");
    } finally {
      setIsLoadingEpisodeData(false);
    }
  }

  async function upload() {
    if (!file) {
      setUploadMsg("Please choose an audio file.");
      return;
    }

    setUploadMsg("");
    setIsUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title) fd.append("title", title);

      const r = await fetch("/api/transcribe", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Transcription failed");

      setUploadMsg("Transcribed ✅");
      setFile(null);
      setTitle("");
      await fetchEpisodes();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unknown error during upload";
      setUploadMsg(msg);
    } finally {
      setIsUploading(false);
    }
  }

  async function doSummarize() {
    if (!selected) return;

    setSummaryMsg("");
    setIsSummarizing(true);

    try {
      const r = await fetch("/api/summarize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ episode_id: selected.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Summarization failed");

      setSummary(j.summary);
      setSummaryMsg("Summarized ✅");
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Unknown error during summarization";
      setSummaryMsg(msg);
    } finally {
      setIsSummarizing(false);
    }
  }

  async function genSocial() {
    if (!selected) return;

    setSocialMsg("");
    setIsGeneratingSocial(true);

    try {
      const r = await fetch("/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ episode_id: selected.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Generation failed");

      setPosts(j.posts);
      setSocialMsg("Social drafts ready ✅");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : "Unknown error during social generation";
      setSocialMsg(msg);
    } finally {
      setIsGeneratingSocial(false);
    }
  }

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
            <span className="gradient-text">Podcast Studio</span>
          </h1>
          <p className="text-white/70">
            Upload episodes, generate clean summaries, and spin out social-ready
            content — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Next.js
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            Supabase
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
            OpenAI
          </span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Left column: episodes + upload */}
        <div className="space-y-6">
          <CardSection
            title="Episodes"
            description="Pick an episode to load summaries and social drafts."
          >
            <ul className="space-y-2 text-sm">
              {episodes.map((ep) => {
                const active = selected?.id === ep.id;
                return (
                  <li key={ep.id}>
                    <button
                      onClick={() => handleSelectEpisode(ep)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition
                      ${
                        active
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-white line-clamp-1">
                          {ep.title || "Untitled episode"}
                        </span>
                        <span className="text-[11px] text-white/50">
                          {new Date(ep.created_at).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
              {episodes.length === 0 && (
                <li className="text-sm text-white/60">
                  No episodes yet. Upload an audio file below.
                </li>
              )}
            </ul>
            {isLoadingEpisodeData && selected && (
              <p className="mt-2 text-[11px] text-white/60">
                Loading saved summaries and social posts…
              </p>
            )}
          </CardSection>

          <CardSection
            title="Upload audio"
            description="Supports typical podcast formats. Title is optional."
          >
            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs text-white/70">
                  Audio file
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm file:mr-4 file:rounded-xl file:border file:border-white/10 file:bg.white/5 file:px-4 file:py-2 file:text-white hover:file:bg-white/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/70">
                  Episode title (optional)
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="e.g., EP12 — The Future of Audio AI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={upload}
                  disabled={!file || isUploading}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white button-glow
                     disabled:opacity-50 bg-gradient-to-r from-accent-purple to-accent-blue"
                >
                  {isUploading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                      Transcribing…
                    </>
                  ) : (
                    "Transcribe episode"
                  )}
                </button>
                {uploadMsg && (
                  <p className="text-xs text-white/70">{uploadMsg}</p>
                )}
              </div>
            </div>
          </CardSection>
        </div>

        {/* Right column: summaries + social */}
        <div className="space-y-6">
          <CardSection
            title="Summaries & insights"
            description="Generate short and long summaries plus topic tags."
          >
            {!selected ? (
              <p className="text-sm text.white/70">
                Select an episode on the left to generate or view summaries.
              </p>
            ) : (
              <div className="space-y-4 text-sm text-white/90">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={doSummarize}
                    disabled={isSummarizing}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white button-glow
                       disabled:opacity-50 bg-gradient-to-r from-accent-purple to-accent-blue"
                  >
                    {isSummarizing ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                        Summarizing…
                      </>
                    ) : (
                      "Generate summary"
                    )}
                  </button>
                  <span className="text-xs text-white/60">
                    Episode:{" "}
                    <span className="font-medium text-white/90">
                      {selected.title || "Untitled episode"}
                    </span>
                  </span>
                </div>

                {summaryMsg && (
                  <p className="text-xs text-white/70">{summaryMsg}</p>
                )}

                {summary?.summary_short && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/70">
                        Short summary
                      </span>
                      <CopyButton text={summary.summary_short} />
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white/90">
                      {summary.summary_short}
                    </p>
                  </div>
                )}

                {summary?.summary_long && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/70">
                        Long summary
                      </span>
                      <CopyButton text={summary.summary_long} />
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white/90">
                      {summary.summary_long}
                    </p>
                  </div>
                )}

                {summary?.topics && summary.topics.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-white/70">Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {summary.topics.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/80"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardSection>

          <CardSection
            title="Social posts"
            description="Generate or view LinkedIn and X-ready snippets."
          >
            {!selected ? (
              <p className="text-sm text-white/70">
                Select an episode on the left to generate or view social drafts.
              </p>
            ) : (
              <div className="space-y-4 text-sm text-white/90">
                <button
                  onClick={genSocial}
                  disabled={isGeneratingSocial}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-white button-glow
                     disabled:opacity-50 bg-gradient-to-r from-accent-purple to-accent-blue"
                >
                  {isGeneratingSocial ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                      Generating drafts…
                    </>
                  ) : (
                    "Generate social drafts"
                  )}
                </button>

                {socialMsg && (
                  <p className="text-xs text-white/70">{socialMsg}</p>
                )}

                {posts?.linkedin && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/70">
                        LinkedIn
                      </span>
                      <CopyButton text={posts.linkedin} />
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white/90">
                      {posts.linkedin}
                    </p>
                  </div>
                )}

                {posts?.tweet_a && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/70">
                        X / Tweet A
                      </span>
                      <CopyButton text={posts.tweet_a} />
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white/90">
                      {posts.tweet_a}
                    </p>
                  </div>
                )}

                {posts?.tweet_b && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-white/70">
                        X / Tweet B
                      </span>
                      <CopyButton text={posts.tweet_b} />
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-white/90">
                      {posts.tweet_b}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardSection>
        </div>
      </div>
      {/* No footer – layout handles it */}
    </main>
  );
}
