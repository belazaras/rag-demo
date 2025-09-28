// app/api/rag/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import type { MatchChunk, RagApiRequest, RagApiResponse } from "@/types/rag";


// Very simple rate limit: 10 requests / minute / IP
const BUCKET: Map<string, { tokens: number; ts: number }> = new Map();
const LIMIT = 10;
const WINDOW_MS = 60_000;

function allow(ip: string) {
  const now = Date.now();
  const bucket = BUCKET.get(ip) ?? { tokens: LIMIT, ts: now };
  // Refill proportional to elapsed time
  const elapsed = now - bucket.ts;
  const refill = Math.floor((elapsed / WINDOW_MS) * LIMIT);
  const tokens = Math.min(LIMIT, bucket.tokens + refill);
  if (tokens <= 0) {
    BUCKET.set(ip, { tokens, ts: now });
    return false;
  }
  BUCKET.set(ip, { tokens: tokens - 1, ts: now });
  return true;
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

async function embedQuery(q: string) {
  const r = await openai.embeddings.create({ model: "text-embedding-3-small", input: q });
  return r.data[0].embedding;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(ip)) {
    return NextResponse.json({ error: "Rate limited. Try again shortly." }, { status: 429 });
  }

  try {
    const { question, topK = 4 } = await req.json();
    if (!question) return NextResponse.json({ error: "Missing question" }, { status: 400 });

    const minScore = Number(process.env.RAG_MIN_SCORE ?? 0.65);

    const qEmb = await embedQuery(question);
    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: qEmb,
      match_count: topK,
      min_score: 0.0, // fetch everything, we’ll enforce threshold below
    });
    if (error) throw error;

    const chunks = (data ?? []) as MatchChunk[];
    const topSim = chunks[0]?.similarity ?? 0;

    // If confidence too low, short-circuit safely
    if (!chunks.length || topSim < minScore) {
      return NextResponse.json({
        answer: `I don't know based on the available documents. (max similarity ${topSim.toFixed(2)})`,
        sources: chunks.slice(0, 3),
        confidence: topSim,
      });
    }

    const context = chunks
      .map((t) => `[${t.title}#${t.chunk_index} | sim ${t.similarity.toFixed(3)}]\n${String(t.text)}`)
      .join("\n\n")
      .slice(0, 8000);

    const messages = [
      {
        role: "system" as const,
        content:
          "You answer ONLY using the provided context. If the answer is not in the context, say \"I don't know\". Be concise (3–6 sentences). If sources conflict, say so briefly. Cite chunks like [title#idx] when useful.",
      },
      { role: "user" as const, content: `QUESTION:\n${question}\n\nCONTEXT:\n${context}` },
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });

    return NextResponse.json<RagApiResponse>({
      answer: res.choices[0].message?.content ?? "",
      sources: chunks,
      confidence: topSim,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[/api/rag] error:", msg);
    return NextResponse.json<RagApiResponse>(
      { answer: "", sources: [], confidence: 0, error: msg },
      { status: 500 }
    );
  }
}
