"use client";
import Link from "next/link";
import Image from "next/image";
import PitchChat from "@/components/PitchChat";
import AvatarRing from "@/components/AvatarRing";

export default function HomePhoto() {
  return (
    <main className="relative">
      {/* Background accent */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-24 left-1/2 h-[680px] w-[680px] -translate-x-1/2 rounded-full blur-[120px] opacity-10 gradient-bg" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-16">
        {/* NAV spacer if using sticky navbar */}
        <div className="h-2" />

        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          {/* Left: copy/CTAs */}
          <div className="grid gap-4">
            <div className="flex items-center justify-center">
              <AvatarRing>
                <Image
                  src="/nico.jpg"
                  alt="Nico Belazaras portrait"
                  width={192}
                  height={192}
                  className="h-48 w-48 rounded-full object-cover object-center translate-y-1 translate-x-1"
                />
              </AvatarRing>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full gradient-bg" />
                Available now
              </div>

              <h1 className="text-4xl leading-tight md:text-5xl font-semibold">
                <span className="gradient-text">Full-Stack & AI Engineer</span>
                <br />
                E-commerce & RAG Systems
              </h1>

              <p className="text-white/70 max-w-xl">
                10+ years building production apps and Shopify solutions.
                Recently focused on retrieval-augmented generation (RAG) and AI
                content pipelines.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/rag"
                  className="rounded-xl px-5 py-3 font-medium text-white button-glow gradient-bg"
                >
                  View RAG Demo
                </Link>
                <Link
                  href="/studio"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-medium text-white/90 hover:bg-white/10"
                >
                  Podcast Studio
                </Link>
                <a
                  href="mailto:belazaras@live.com"
                  className="text-sm underline text-white/70 hover:text-white"
                >
                  belazaras@live.com
                </a>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "TypeScript-first",
                  "Supabase + pgvector",
                  "OpenAI",
                  "Shopify Hydrogen",
                  "Remix / Next.js",
                ].map((t) => (
                  <span
                    key={t}
                    className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: chat card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-2 md:p-3 shadow-[0_0_40px_rgba(0,0,0,0.15)]">
            <PitchChat />
          </div>
        </section>

        {/* Services */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What I Do</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "AI Knowledge Assistants (RAG)",
                desc: "Ingest docs, build grounded Q&A with sources. Supabase pgvector + OpenAI.",
              },
              {
                title: "Podcast → Social Pipelines",
                desc: "Transcribe, summarize, and generate posts ready for LinkedIn/X.",
              },
              {
                title: "Headless E-commerce",
                desc: "Shopify Hydrogen/Remix, custom apps, ERP/CRM integrations.",
              },
              {
                title: "Performance & DX",
                desc: "Perf audits, SEO wins, modern tooling, clean TypeScript.",
              },
            ].map((it) => (
              <li
                key={it.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition"
              >
                <div className="font-medium">{it.title}</div>
                <p className="mt-1 text-sm text-white/70">{it.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Work */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Selected Work</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition">
              <div className="font-medium">
                Taygra Shoes — Headless Shopify Rebuild
              </div>
              <p className="mt-1 text-sm text-white/70">
                Hydrogen + Remix + Storefront API; speed & SEO improvements;
                modern UX.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition">
              <div className="font-medium">Podcast → Social Studio</div>
              <p className="mt-1 text-sm text-white/70">
                Whisper transcription + GPT summaries + LinkedIn/Twitter drafts.
              </p>
              <Link
                href="/studio"
                className="mt-2 inline-block text-sm underline"
              >
                Open Studio →
              </Link>
            </article>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p className="text-white/80">
            <a className="underline" href="mailto:belazaras@live.com">
              belazaras@live.com
            </a>
            {" · "}
            <a
              className="underline"
              href="https://www.linkedin.com/in/belazaras/"
              target="_blank"
            >
              LinkedIn
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
