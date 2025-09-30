// app/api/transcribe/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || "Untitled episode";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 1) Create episode row
    const { data: ep, error: epErr } = await supabase
      .from("episodes")
      .insert({ title, source: `upload://${file.name}` })
      .select()
      .single();
    if (epErr) throw epErr;

    // 2) Transcribe with Whisper API
    const audio = await file.arrayBuffer();
    const audioBlob = new Blob([audio], { type: file.type || "audio/mpeg" });

    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBlob], file.name),
      model: "whisper-1",  // OpenAI Whisper
      response_format: "verbose_json"
    });

    const text = transcription.text?.trim() || "";
    const language = transcription.language || null;
    if (!text) {
      return NextResponse.json({ error: "Empty transcription" }, { status: 400 });
    }

    // 3) Store transcript
    const { data: tr, error: trErr } = await supabase
      .from("transcripts")
      .insert({ episode_id: ep.id, text, language })
      .select()
      .single();
    if (trErr) throw trErr;

    return NextResponse.json({ ok: true, episode: ep, transcript: tr });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Transcription failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
