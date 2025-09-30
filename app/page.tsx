// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="grid gap-3">
        <h1 className="text-3xl md:text-4xl font-semibold">Full-Stack & AI Engineer • E-commerce & RAG Systems</h1>
        <p className="text-gray-600 dark:text-neutral-400 max-w-3xl">
          10+ years building full-stack apps and Shopify custom solutions. Recently focused on
          retrieval-augmented generation (RAG) and AI content pipelines.
        </p>
        <div className="flex gap-3">
          <Link href="/rag" className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black">View RAG Demo</Link>
          <Link href="/studio" className="rounded-lg border px-4 py-2 dark:border-neutral-700">Podcast Studio</Link>
        </div>
      </section>

      {/* Services / Offering */}
      <section className="grid gap-2">
        <h2 className="text-xl font-medium">What I Do</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          <li className="rounded-xl border p-4 dark:border-neutral-800">
            <div className="font-medium">AI Knowledge Assistants (RAG)</div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">Ingest docs, build grounded Q&A with sources. Supabase pgvector + OpenAI.</p>
          </li>
          <li className="rounded-xl border p-4 dark:border-neutral-800">
            <div className="font-medium">Podcast → Social Pipelines</div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">Transcribe, summarize, and generate posts ready for LinkedIn/X.</p>
          </li>
          <li className="rounded-xl border p-4 dark:border-neutral-800">
            <div className="font-medium">Headless E-commerce</div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">Shopify Hydrogen/Remix, custom apps, ERP/CRM integrations.</p>
          </li>
          <li className="rounded-xl border p-4 dark:border-neutral-800">
            <div className="font-medium">Performance & DX</div>
            <p className="text-sm text-gray-600 dark:text-neutral-400">Perf audits, SEO wins, modern tooling, clean TypeScript.</p>
          </li>
        </ul>
      </section>

      {/* Case studies */}
      <section className="grid gap-3">
        <h2 className="text-xl font-medium">Selected Work</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border p-4 dark:border-neutral-800">
            <div className="font-medium">Taygra Shoes — Headless Shopify Rebuild</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">Hydrogen + Remix + Storefront API; speed & SEO improvements; modern UX.</p>
          </article>
          <article className="rounded-xl border p-4 dark:border-neutral-800">
            <div className="font-medium">Podcast → Social Studio</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">Whisper transcription + GPT summaries + LinkedIn/Twitter drafts.</p>
            <Link href="/studio" className="mt-2 inline-block text-sm underline">Open Studio →</Link>
          </article>
        </div>
      </section>

      {/* Contact */}
      <section className="grid gap-2">
        <h2 className="text-xl font-medium">Contact</h2>
        <p>
          <a className="underline" href="mailto:belazaras@live.com">belazaras@live.com</a>
          {" · "}
          <a className="underline" href="https://www.linkedin.com/in/belazaras/" target="_blank">LinkedIn</a>
        </p>
      </section>
    </div>
  );
}
