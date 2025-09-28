# 🧩 RAG Pipeline Demo — Next.js + Supabase + OpenAI

A **production-ready Retrieval-Augmented Generation (RAG)** demo.  
Upload documents (`.pdf`, `.txt`, `.md`), ask natural-language questions, and get grounded answers with cited sources.

Built with **Next.js App Router**, **Supabase pgvector**, and **OpenAI GPT-4o mini**.

---

## ✨ Features

- 📄 Upload & ingest documents (max 2 MB each)
- 🔍 Automatic chunking + embeddings (OpenAI `text-embedding-3-small`)
- 📦 Vector storage in Supabase (pgvector)
- 🤖 Ask questions → answers grounded in your docs
- 📝 Sources cited with similarity scores
- ⛔ Graceful “I don’t know” fallback when context is weak
- 🛡️ File size guard + basic rate-limiting
- 🚀 Deployable to Vercel in minutes

---

## 🛠️ Stack

- **Frontend**: Next.js 14 (App Router, React 18, Tailwind CSS)
- **Backend**: Next.js API Routes (Node.js runtime)
- **Database**: Supabase with pgvector extension
- **AI**: OpenAI GPT-4o mini + text-embedding-3-small
- **Parsing**: `pdf-parse` for PDFs, native text for `.txt` / `.md`

---

## 🚀 Getting Started

### 1. Clone & install
```bash
git clone https://github.com/yourname/rag-demo.git
cd rag-demo
npm install
```

### 2. Set up environment
Create `.env.local`:
```ini
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
RAG_MIN_SCORE=0.65
```

> ⚠️ Never expose the Service Role in client code — only inside server routes.

### 3. Run locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## 📤 Deployment (Vercel)

1. Push to GitHub
2. Create new project in [Vercel](https://vercel.com)
3. Framework: **Next.js**
4. Add env vars (see above) in **Vercel → Settings → Environment Variables**
5. Deploy 🚀

Optional `vercel.json` to ensure Node runtime:
```json
{
  "functions": {
    "api/**": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

---

## 📚 API Endpoints

### `POST /api/upload`
Upload a document for ingestion.
- Form fields:
  - `file` (File, required) — `.pdf`, `.txt`, `.md` (max 2 MB)
  - `title` (string, optional) — override doc title
  - `doc_id` (string, optional) — custom ID for filtering
- Response: `{ ok, doc_id, title, chunks, inserted, message }`

### `POST /api/rag`
Ask a question against the ingested corpus.
- Body: `{ question: string, topK?: number, minScore?: number }`
- Response: `{ answer, sources[], confidence }`

---

## 🧪 Example

```bash
curl -s -X POST http://localhost:3000/api/rag   -H "content-type: application/json"   -d '{"question":"What does the document say about Shopify?"}' | jq
```

Response:
```json
{
  "answer": "The document describes a Shopify storefront rebuilt with Hydrogen and Remix...",
  "sources": [
    { "doc_id": "store.pdf", "chunk_index": 3, "similarity": 0.82, "text": "..." }
  ],
  "confidence": 0.82
}
```

---

## 🧱 Roadmap

- [ ] Delete/list docs via `/api/docs`
- [ ] Per-doc filtering in `/api/rag`
- [ ] Streaming answers (token-by-token)
- [ ] Supabase Auth + RLS for per-user corpora
- [ ] Drag-and-drop upload UI + progress bar

---

## 👤 Author

Built by **Nico Belazaras** – Senior Full-Stack Engineer, E‑Commerce & SaaS Specialist.  
📍 London · [LinkedIn](https://www.linkedin.com/in/belazaras/)  

If you like this repo, ⭐ it on GitHub!  
