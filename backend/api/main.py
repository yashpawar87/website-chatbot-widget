import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import chat
from backend.config import backend_config

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Website RAG Chatbot API",
    description="API for the Website RAG Chatbot",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=backend_config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, tags=["chat"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/health/rag")
async def health_rag():
    try:
        from ai.rag.vector_store import get_qdrant_client
        client = get_qdrant_client()
        # Just pinging by getting collections
        client.get_collections()
        qdrant_status = "ok"
    except Exception as e:
        qdrant_status = f"error: {str(e)}"
        
    try:
        from ai.config import ai_config
        if not ai_config.groq_api_key:
            llm_status = "error: GROQ_API_KEY not configured"
        else:
            llm_status = "ok"
    except Exception as e:
        llm_status = f"error: {str(e)}"
        
    status = "ok" if qdrant_status == "ok" and llm_status == "ok" else "error"
    return {"status": status, "qdrant": qdrant_status, "llm": llm_status}
