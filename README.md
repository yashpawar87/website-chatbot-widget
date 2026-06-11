# Website RAG Chatbot Widget

A production-ready Retrieval-Augmented Generation (RAG) chatbot widget designed to be embedded into any website. It uses FastAPI, Next.js, LangChain, Qdrant Cloud, and Groq (LLaMa 3) to answer questions based strictly on a target website's content.

## 🏗️ Architecture & Tech Stack

- **Backend**: FastAPI (Python 3) handling the RAG pipeline and API endpoints.
- **Frontend**: Next.js 14 (React, Tailwind CSS, App Router) serving the chatbot UI and embeddable widget script.
- **AI Core**: 
  - LangChain for orchestration.
  - HuggingFace local embeddings (`BAAI/bge-small-en-v1.5`).
  - Groq LLM (`llama-3.3-70b-versatile`) for blazing-fast inference.
- **Vector Database**: Qdrant (supports both local disk storage and Qdrant Cloud).
- **Data Source**: WordPress REST API ingestion pipeline.

## ✨ Key Features

- **Embeddable Iframe Widget**: A lightweight `widget.js` script that injects a floating, interactive chatbot bubble into the bottom corner of any website.
- **Two-Step Onboarding Wizard**: A guided, clean UI that presents users with categorized quick-start questions (e.g., Tech Solutions, Careers, Partnerships) to reduce cognitive load.
- **Smart Fallback UX**: If the LLM cannot confidently answer a question using the retrieved context, it gracefully fails with friendly copy and automatically suggests related questions or provides an "Ask in a different way" action to keep the user engaged.
- **Source Citations**: The UI natively supports displaying clickable reference cards, citing exactly which source URLs the LLM used to formulate its answer.
- **Robust Security**: Includes in-memory IP rate limiting, question length constraints, and prompt injection keyword detection.
- **Observability**: Fully integrated with LangSmith for deep tracing, debugging, and monitoring of retrieval performance and LLM latency.

---

## 🛠️ Detailed Setup Guide

### 1. Backend Initialization & Environment

First, clone the repository and set up the Python virtual environment for the backend services.

```bash
# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the root directory and configure the necessary keys:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:3000
WORDPRESS_URL=https://your-wordpress-site.com

# Vector Database (Leave blank to use local disk storage in /data)
QDRANT_URL=
QDRANT_API_KEY=

# Optional: LangSmith Tracing
LANGCHAIN_TRACING_V2=false
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=your_langsmith_key_here
LANGCHAIN_PROJECT=website_chatbot
```

### 2. Run Data Ingestion

Before the chatbot can answer questions, you must populate the Qdrant vector database with your website's content. The built-in ingestion pipeline fetches all posts and pages from the configured WordPress REST API, chunks them semantically, embeds them, and stores them.

```bash
# Ensure your virtual environment is active
source .venv/bin/activate

# Run the ingestion script
python -m ai.ingestion.ingest
```

### 3. Start the FastAPI Backend

Start the FastAPI development server. This server exposes the `/chat` endpoint and health checks.

```bash
uvicorn backend.api.main:app --reload --port 8000
```

*Tip: Verify the health of your RAG pipeline and database connection by visiting `http://localhost:8000/health/rag`.*

### 4. Start the Next.js Frontend

The frontend serves both the standalone chat UI and the embeddable `widget.js` script.

Open a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Next.js development server
npm run dev
```

You can view the full-page chatbot UI at `http://localhost:3000`.

### 5. Embedding the Widget on a Website

To embed the chatbot into an external website (like your main WordPress site), copy the `chatbot_logo.png` to your frontend's public directory (if not already there) and include the following script tag just before the closing `</body>` tag of your HTML:

```html
<!-- The widget script automatically targets the host domain it is served from -->
<script src="http://localhost:3000/widget.js"></script>
```

When deploying to production, simply change `http://localhost:3000` to your actual Vercel or production frontend URL. The `widget.js` script securely handles iframe injection and toggle state animations using your custom chatbot logo.

## 🚀 Deployment

- **Backend**: Can be deployed on Render, Railway, or AWS. Ensure the `.env` variables are securely added to the host environment.
- **Frontend**: Optimized for Vercel. Ensure you set the `NEXT_PUBLIC_API_URL` (if configured) or handle routing so the frontend knows where the FastAPI backend lives in production.
- **Database**: Use Qdrant Cloud for a production-ready, serverless vector database. Update `QDRANT_URL` and `QDRANT_API_KEY` in your production environment.
