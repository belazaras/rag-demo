import { NextRequest } from "next/server";
import OpenAI from "openai";
import { PITCH_SYSTEM_PROMPT } from "@/app/lib/pitchPrompt";
import { HIGHLIGHTS, FAQ } from "@/app/lib/pitchFacts";

export const runtime = "edge";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

function buildMessages(userText: string) {
  const facts =
    "Key highlights:\n- " +
    HIGHLIGHTS.join("\n- ") +
    "\n\nFAQs:\n" +
    FAQ.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");

  return [
    { role: "system", content: PITCH_SYSTEM_PROMPT },
    {
      role: "user",
      content:
        `Use these facts for grounding (do not recite verbatim):\n${facts}\n\n` +
        `Prospect: ${userText}\n` +
        `Goal: Persuasive, concise answer + one clear CTA.`,
    },
  ] as OpenAI.ChatCompletionMessageParam[];
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = String(formData.get("text") || "")
    .slice(0, 4000)
    .trim();
  if (!text) {
    return new Response(JSON.stringify({ error: "Empty message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: buildMessages(text),
    temperature: 0.6,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of completion) {
          const delta = part.choices?.[0]?.delta?.content || "";
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
