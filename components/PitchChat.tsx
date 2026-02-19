"use client";
import * as React from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string };

export default function PitchChat() {
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const user: Msg = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((m) => [...m, user]);
    setInput("");
    setLoading(true);

    const fd = new FormData();
    fd.append("text", user.content);
    const res = await fetch("/api/chat", { method: "POST", body: fd });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let assistant: Msg = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    setMessages((m) => [...m, assistant]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      assistant = {
        ...assistant,
        content: assistant.content + decoder.decode(value),
      };
      setMessages((m) => m.map((x) => (x.id === assistant.id ? assistant : x)));
    }
    setLoading(false);
  }

  const seedPrompts = [
    "What would a 4-week headless ecommerce sprint look like?",
    "How do you scope a headless Shopify build?",
    "Can you handle React Native work too?",
    "Typical timelines and engagement models?",
  ];

  return (
    <div className="flex flex-col h-[80vh] bg-[#0B0B0C] text-white rounded-2xl border border-white/10 overflow-hidden">
      <header className="p-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="font-semibold text-lg gradient-text">Hire Nico</h1>
        <div className="text-xs text-white/60">React • Node.js • Shopify</div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] ${
              m.role === "user" ? "ml-auto" : "mr-auto"
            } rounded-2xl p-4 leading-relaxed ${
              m.role === "user"
                ? "bg-white/10"
                : "border border-transparent [background:linear-gradient(#0B0B0C,#0B0B0C)_padding-box,linear-gradient(to_right,#8B5CF6,#3B82F6)_border-box]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-white/60 text-sm">
            Ask about process, timelines, tech choices, or share your project
            context. I’ll outline options and next steps.
          </div>
        )}
        {loading && (
          <div className="mr-auto max-w-[70%] rounded-2xl p-4 bg-white/5 border border-white/10">
            <span className="animate-pulse">Thinking…</span>
          </div>
        )}

        {/* Seed prompts */}
        {messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {seedPrompts.map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="text-xs px-3 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about process, rates, timelines, tech…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/20"
          />
          <button
            disabled={loading}
            className="gradient-bg text-white px-5 py-3 rounded-xl font-medium button-glow"
          >
            Send
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between text-sm">
          <a
            href="mailto:belazaras@live.com"
            className="underline text-white/80 hover:text-white"
          >
            Email Nico
          </a>
          <a
            href="https://contra.com/nico_belazaras_mk4p9na1/work"
            target="_blank"
            className="underline text-white/80 hover:text-white"
          >
            View portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
