// app/api/social/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

const SYS = `You are a social media copywriter. Produce compelling, non-generic copy.`;

export async function POST(req: NextRequest) {
  try {
    const { episode_id } = await req.json();
    if (!episode_id) return NextResponse.json({ error: "episode_id required" }, { status: 400 });

    const { data: ep, error: epErr } = await supabase
      .from("episodes").select("id,title").eq("id", episode_id).single();
    if (epErr) throw epErr;

    const { data: s, error: sErr } = await supabase
      .from("episode_summaries").select("*").eq("episode_id", episode_id).single();
    if (sErr) throw sErr;

    const prompt = `
Title: ${ep.title}
Short summary:\n${s.summary_short}
Long summary:\n${s.summary_long}
Quotes:\n${JSON.stringify(s.quotes, null, 2)}
Topics: ${s.topics?.join(", ")}

TASK:
1) A LinkedIn post (200–300 words) with a strong hook and 3–5 concise takeaways. Avoid hashtags in body; add 2–3 at end.
2) Two X/Twitter posts (<= 280 chars each). Each must stand alone and include a punchy hook or quote.
Return JSON:
{
  "linkedin": "...",
  "tweet_a": "...",
  "tweet_b": "..."
}
`.trim();

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const out = JSON.parse(res.choices[0].message?.content || "{}");

    const { data: saved, error: saveErr } = await supabase
      .from("social_posts")
      .insert({ episode_id, linkedin: out.linkedin, tweet_a: out.tweet_a, tweet_b: out.tweet_b })
      .select()
      .single();
    if (saveErr) throw saveErr;

    return NextResponse.json({ ok: true, posts: saved });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Social generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
