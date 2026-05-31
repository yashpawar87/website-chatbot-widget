import logging
import time
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from backend.api.schemas.request import ChatRequest
from backend.api.schemas.response import ChatResponse
from backend.api.services.chat_service import ChatService

logger = logging.getLogger(__name__)
router = APIRouter()

# Simple In-Memory Rate Limiter
RATE_LIMIT_WINDOW = 60 # seconds
MAX_REQUESTS_PER_WINDOW = 10
request_counts = defaultdict(list)

def check_rate_limit(client_ip: str):
    current_time = time.time()
    # Clean up old timestamps
    request_counts[client_ip] = [ts for ts in request_counts[client_ip] if current_time - ts < RATE_LIMIT_WINDOW]
    
    if len(request_counts[client_ip]) >= MAX_REQUESTS_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many requests. Please try again later.")
    
    request_counts[client_ip].append(current_time)

INJECTION_KEYWORDS = [
    "ignore previous", "system prompt", "ignore above", "override instructions",
    "you are now a", "translate the system prompt", "reveal your instructions"
]

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, fastapi_req: Request):
    # Use X-Forwarded-For if behind a proxy, otherwise fallback to direct client IP
    forwarded_for = fastapi_req.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = fastapi_req.client.host if fastapi_req.client else "unknown"
        
    check_rate_limit(client_ip)

    if len(request.question) > 500:
        raise HTTPException(status_code=400, detail="Question is too long (maximum 500 characters).")
        
    question_lower = request.question.lower()
    for kw in INJECTION_KEYWORDS:
        if kw in question_lower:
            raise HTTPException(status_code=400, detail="Potential prompt injection detected.")

    try:
        # Running synchronous LangChain code in a threadpool to avoid blocking the event loop
        response = await run_in_threadpool(ChatService.get_answer, request.question, request.history)
        return response
    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
