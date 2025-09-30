// app/api/episodes/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Episode = {
  id: string;
  title: string;
  source: string;
  created_at: string;
  duration_seconds: number | null;
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE! // server-only
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam ?? 20), 1), 100); // 1..100

    const { data, error } = await supabase
      .from("episodes")
      .select("id,title,source,created_at,duration_seconds")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const episodes = (data ?? []) as Episode[];
    return NextResponse.json(episodes);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
