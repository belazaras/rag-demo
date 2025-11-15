// app/api/social/route.ts
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

const SYS = `You are a social media copywriter. Produce compelling, non-generic copy.`;

export async function POST(req: NextRequest) {
  try {
    const { episode_id } = await req.json();
    if (!episode_id) {
      return NextResponse.json(
        { error: "episode_id required" },
        { status: 400 },
      );
    }

    // Episode
    const { data: ep, error: epErr } = await supabase
      .from("episodes")
      .select("id,title")
      .eq("id", episode_id)
      .single();

    if (epErr || !ep) {
      console.error("social / episode error", epErr);
      return NextResponse.json({ error: "Episode not found" }, { status: 404 });
    }

    const { data: s, error: sErr } = await supabase
      .from("episode_summaries")
      .select("summary_short, summary_long, quotes, topics, created_at")
      .eq("episode_id", episode_id)
      .order("created_at", { ascending: false }) // latest first
      .limit(1)
      .single(); // now it's truly a single row

    if (sErr) {
      console.error("social / summary error", sErr);
      return NextResponse.json(
        { error: "Failed to load summary" },
        { status: 500 },
      );
    }

    if (!s) {
      return NextResponse.json(
        {
          error:
            "No summary found for this episode. Run the summarization step first.",
        },
        { status: 400 },
      );
    }

    const prompt = `
Title: ${ep.title ?? "Untitled episode"}
Short summary:
${s.summary_short ?? "(none)"}

Long summary:
${s.summary_long ?? "(none)"}

Quotes:
${JSON.stringify(s.quotes ?? [], null, 2)}

Topics: ${(s.topics ?? []).join(", ")}

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    let out: { linkedin?: string; tweet_a?: string; tweet_b?: string };
    try {
      out = JSON.parse(content);
    } catch (err) {
      console.error("social / JSON parse error", content, err);
      throw new Error("Failed to parse OpenAI JSON response");
    }

    if (!out.linkedin || !out.tweet_a || !out.tweet_b) {
      throw new Error("OpenAI JSON missing one or more required fields");
    }

    const { data: saved, error: saveErr } = await supabase
      .from("social_posts")
      .insert({
        episode_id,
        linkedin: out.linkedin,
        tweet_a: out.tweet_a,
        tweet_b: out.tweet_b,
      })
      .select()
      .single();

    if (saveErr) {
      console.error("social / save error", saveErr);
      throw saveErr;
    }

    return NextResponse.json({ ok: true, posts: saved });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Social generation failed";
    console.error("social / unhandled error", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// NEW: GET – return latest social posts for episode_id
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

    const { data: posts, error } = await supabase
      .from("social_posts")
      .select("linkedin, tweet_a, tweet_b, created_at")
      .eq("episode_id", episode_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("social GET / posts error", error);
      return NextResponse.json(
        { error: "Failed to load social posts" },
        { status: 500 },
      );
    }

    // No posts yet is fine – return null
    return NextResponse.json({ posts: posts ?? null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load social posts";
    console.error("social GET / unhandled", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
