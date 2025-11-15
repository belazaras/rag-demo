// app/api/summarize/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
);

const SYS = `You extract structured insights from transcripts. 
Return strict JSON matching this schema:

{
  "summary_short": "• bullet 1\\n• bullet 2\\n• bullet 3\\n• bullet 4\\n• bullet 5",
  "summary_long": "one to two paragraphs",
  "topics": ["topic1","topic2","topic3"],
  "quotes": [{"quote":"...", "start":0, "end":12}],
  "entities": {"people":[], "companies":[], "tools":[]}
}`;

export async function POST(req: NextRequest) {
  try {
    const { episode_id } = await req.json();
    if (!episode_id)
      return NextResponse.json(
        { error: "episode_id required" },
        { status: 400 },
      );

    const { data: tr, error: trErr } = await supabase
      .from("transcripts")
      .select("text, episode_id")
      .eq("episode_id", episode_id)
      .single();
    if (trErr) throw trErr;

    const prompt = `TRANSCRIPT:\n${tr.text.slice(0, 20000)}`;

    const chat = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const json = JSON.parse(chat.choices[0].message?.content || "{}");

    const { error: insErr, data: summary } = await supabase
      .from("episode_summaries")
      .insert({
        episode_id,
        summary_short: json.summary_short,
        summary_long: json.summary_long,
        topics: json.topics || [],
        quotes: json.quotes || [],
        entities: json.entities || {},
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return NextResponse.json({ ok: true, summary });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Summarization failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// NEW: GET – return latest summary for episode_id
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const episode_id = searchParams.get("episode_id");

    if (!episode_id) {
      return NextResponse.json(
        { error: "episode_id required" },
        { status: 400 },
      );
    }

    const { data: summary, error } = await supabase
      .from("episode_summaries")
      .select("summary_short, summary_long, quotes, topics, created_at")
      .eq("episode_id", episode_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("summarize GET / summary error", error);
      return NextResponse.json(
        { error: "Failed to load summary" },
        { status: 500 },
      );
    }

    // No summary yet is not an error – just return null
    return NextResponse.json({ summary: summary ?? null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load summary";
    console.error("summarize GET / unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
