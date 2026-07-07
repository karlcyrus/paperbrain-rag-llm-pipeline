# 🧠 PaperBrain

> AI-powered document Q&A — upload your documents and chat with them using intelligent retrieval.

![Screenshot placeholder](screenshot here)

---

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| Framework    | Next.js 16 (App Router)           |
| Language     | TypeScript                        |
| Styling      | Tailwind CSS v4                   |
| Auth & DB    | Supabase (Auth + PostgreSQL)      |
| Vector Store | Supabase pgvector                 |
| AI Model     | Google Gemini API (REST)          |

## Features

- **Document Upload** — Drag & drop PDFs, TXT, or DOCX files (up to 10 MB)
- **AI Chat** — Ask natural language questions and get streaming, cited answers
- **Multi-Document Chat** — Select multiple documents and chat across all of them
- **Source Citations** — Every answer links back to the exact document passages used
- **RAG Pipeline** — Retrieval-Augmented Generation for accurate, grounded responses
- **Chat History** — Conversations persist in localStorage across page refreshes
- **Dark Mode** — Toggle between light and dark themes
- **Responsive Design** — Works seamlessly on mobile and desktop

## How RAG Works

PaperBrain uses **Retrieval-Augmented Generation (RAG)** to answer questions accurately from your documents:

```
┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  Upload Doc  │────▶│  Parse & Chunk │────▶│ Generate Embeddings│
│  (PDF/TXT/   │     │  (Split into   │     │ (Gemini Embedding  │
│   DOCX)      │     │   ~500 token   │     │  API → 768-dim     │
│              │     │   chunks)      │     │  vectors)          │
└──────────────┘     └───────────────┘     └──────────┬───────┘
                                                       │
                                                       ▼
                                            ┌──────────────────┐
                                            │ Store in Supabase │
                                            │ pgvector          │
                                            └──────────────────┘

┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
│  User Asks   │────▶│ Embed Question │────▶│ Vector Similarity  │
│  a Question  │     │ (Same model)   │     │ Search (Top 8      │
│              │     │                │     │ matching chunks)   │
└──────────────┘     └───────────────┘     └──────────┬───────┘
                                                       │
                                                       ▼
                                            ┌──────────────────┐
                                            │ Build RAG Prompt   │
                                            │ (Chunks + Question)│
                                            │        │           │
                                            │        ▼           │
                                            │ Gemini 2.5 Flash   │
                                            │ (Streaming Answer)  │
                                            └──────────────────┘
```

1. **Upload** — Documents are parsed and split into overlapping text chunks (~500 tokens each)
2. **Embed** — Each chunk is converted to a 768-dimensional vector using Gemini's embedding model
3. **Store** — Vectors are stored in Supabase with pgvector for fast similarity search
4. **Query** — When you ask a question, it's embedded using the same model
5. **Retrieve** — The top 8 most similar chunks are found via cosine similarity
6. **Generate** — The retrieved chunks + your question are sent to Gemini 2.5 Flash for a streaming answer

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Supabase](https://supabase.com/) account (free tier works)
- [Google AI Studio](https://aistudio.google.com/) API key for Gemini

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/paperbrain.git
cd paperbrain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Supabase Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  file_type text not null,
  created_at timestamptz default now()
);

-- Document chunks with embeddings
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  content text not null,
  embedding vector(768),
  chunk_index integer not null,
  created_at timestamptz default now()
);

-- RPC function for similarity search
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_count int default 8,
  filter_document_ids uuid[] default '{}'
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where dc.document_id = any(filter_document_ids)
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Row Level Security
alter table documents enable row level security;
alter table document_chunks enable row level security;

create policy "Users can manage their own documents"
  on documents for all using (auth.uid() = user_id);

create policy "Users can manage chunks of their documents"
  on document_chunks for all
  using (document_id in (select id from documents where user_id = auth.uid()));
```

### 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles + dark mode
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── dashboard/page.tsx      # Document management + upload
│   ├── chat/
│   │   ├── [documentId]/page.tsx  # Single document chat
│   │   └── multi/page.tsx         # Multi-document chat
│   └── api/
│       ├── upload/route.ts     # File upload + parsing + embedding
│       ├── chat/route.ts       # RAG chat endpoint
│       ├── documents/route.ts  # List documents
│       └── documents/[id]/route.ts  # Delete document
├── components/
│   ├── Navbar.tsx              # Navigation bar
│   ├── ThemeProvider.tsx       # Dark mode context provider
│   ├── ThemeToggle.tsx         # Sun/moon toggle button
│   ├── UploadZone.tsx          # Drag & drop file upload
│   ├── DocumentCard.tsx        # Document card with actions
│   ├── ChatMessage.tsx         # Chat message bubble
│   ├── ChatInput.tsx           # Chat text input
│   ├── SourceCitation.tsx      # Expandable source citations
│   └── EmptyState.tsx          # Empty state placeholder
├── lib/
│   ├── supabase.ts             # Client-side Supabase client
│   ├── supabase-server.ts      # Server-side Supabase client
│   ├── gemini.ts               # Gemini API (embeddings + chat)
│   ├── chunker.ts              # Text chunking logic
│   └── parser.ts               # Document parser (PDF/TXT/DOCX)
└── proxy.ts                    # Auth middleware (proxy)
```

## License

MIT License — see [LICENSE](LICENSE) for details.
