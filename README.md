# Website RAG Chatbot

A production-ready Retrieval-Augmented Generation (RAG) chatbot using FastAPI, Next.js, LangChain, Qdrant Cloud, and Groq (LLaMa 3) to answer questions based on a WordPress website's content.

## Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js (React, Tailwind CSS, App Router)
- **AI Core**: LangChain, HuggingFace embeddings (`BAAI/bge-small-en-v1.5`), Groq LLM (`llama-3.3-70b-versatile`)
- **Database**: Qdrant Cloud (or Local)
- **Data Source**: WordPress REST API

## Features

- **Embeddable Widget**: Includes a `widget.js` script that can be embedded into any website (e.g., WordPress) to display a floating chatbot bubble in the corner.
- **Robust Security**: Features in-memory IP rate limiting, question length limits, and prompt injection detection.
- **Multi-turn Chat**: Preserves conversational history and condenses follow-up questions to provide accurate, context-aware answers.
- **Observability**: Fully integrated with LangSmith for tracing, debugging, and monitoring retrieval performance.
- **Source Cards**: The UI displays clickable reference cards citing exactly which WordPress page the answer came from.

## Setup

### 1. Backend Initialization

Create a virtual environment and install requirements:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Variables

Ensure your `.env` file is configured with the necessary keys:
```env
GROQ_API_KEY=your-groq-key
FRONTEND_URL=http://localhost:3000
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5

# Optional: Qdrant Cloud Settings
QDRANT_URL=your-qdrant-url
QDRANT_API_KEY=your-qdrant-key

# Optional: LangSmith Settings
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
```

### 3. Run Data Ingestion

Populate your Qdrant database with the WordPress content:
```bash
source .venv/bin/activate
python scripts/rebuild_index.py
```

### 4. Start FastAPI Backend

```bash
uvicorn backend.api.main:app --reload --port 8000
```
*Tip: You can check the health of the RAG pipeline by visiting `http://localhost:8000/health/rag`.*

### 5. Start Next.js Frontend

Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:3000` to interact with the full-screen chatbot UI.

### 6. Embed the Widget

To embed the chatbot into any external website, include the following snippet just before the closing `</body>` tag of your HTML:

```html
<script 
    src="http://localhost:3000/widget.js" 
    data-api-url="http://localhost:8000">
</script>
```
*(Make sure to update the URLs to point to your production Vercel/Render deployments once live!)*
