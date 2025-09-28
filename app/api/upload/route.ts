// app/api/upload/route.ts
export const runtime = 'nodejs';        // pdf-parse needs Node APIs
export const dynamic = 'force-dynamic'; // avoid edge/static optimization

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { UploadApiResponse } from "@/types/rag";

// CommonJS module — load via require in Node runtime
const pdfParse = (eval("require") as NodeRequire)("pdf-parse");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE! // server-only!
);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB in bytes

// Char-based chunking with overlap (good default)
function chunkByChars(text: string, size = 1200, overlap = 150) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size - overlap) {
    chunks.push(clean.slice(i, i + size));
  }
  return chunks;
}

async function embed(text: string): Promise<number[]> {
  const r = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return r.data[0].embedding;
}

/**
 * Extract readable text from an uploaded File.
 * - .txt/.md -> use file.text()
 * - .pdf     -> build Buffer from arrayBuffer() and pass to pdf-parse
 */
async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop();

  if (ext === "txt" || ext === "md") {
    return await file.text();
  }

  if (ext === "pdf") {
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    if (!buf.length) throw new Error("Empty PDF buffer (upload likely failed)");
    // Optional debug:
    // console.log("PDF buffer length:", buf.length, "magic:", buf.subarray(0, 4).toString());
    const data = await pdfParse(buf);
    return data.text || "";
  }

  throw new Error("Unsupported file type. Please upload .txt, .md, or .pdf");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const docId = (form.get("doc_id") as string) || "";       // optional custom ID
    const titleOverride = (form.get("title") as string) || ""; // optional title

    if (!file) {
      return NextResponse.json({ error: "No file uploaded (field: file)" }, { status: 400 });
    }

    // ✅ Size check (2 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size is 2 MB, received ${(file.size / (1024 * 1024)).toFixed(2)} MB` },
        { status: 400 }
      );
    }

    const text = await extractText(file);
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "No readable text found in file." }, { status: 400 });
    }

    // Chunk → embed → insert
    const chunks = chunkByChars(text, 1200, 150);
    const title = titleOverride || file.name.replace(/\.[^.]+$/, "");
    const source = `upload://${file.name}`;
    const doc_id = docId || file.name;

    // Replace old chunks for same doc_id (idempotent re-ingest)
    const { error: delErr } = await supabase.from("chunks").delete().eq("doc_id", doc_id);
    if (delErr) {
      console.error("Delete error:", delErr);
      // Not fatal — continue, but you may want to return 500 if you prefer strict behavior
    }

    let inserted = 0;
    for (let i = 0; i < chunks.length; i++) {
      const cText = chunks[i];
      if (!cText || cText.trim().length < 5) continue;

      const embedding = await embed(cText);

      const { error } = await supabase.from("chunks").insert({
        doc_id,
        title,
        source,
        chunk_index: i,
        text: cText,
        embedding,
      });

      if (error) {
        console.error("Insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      inserted++;
    }

    return NextResponse.json<UploadApiResponse>({
      ok: true,
      doc_id,
      title,
      chunks: chunks.length,
      inserted,
      message: `Ingested ${inserted}/${chunks.length} chunks from ${file.name}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[/api/upload] error:", msg);
    return NextResponse.json<UploadApiResponse>(
      { ok: false, doc_id: "", title: "", chunks: 0, inserted: 0, message: "", error: msg },
      { status: 500 }
    );
  }
}
