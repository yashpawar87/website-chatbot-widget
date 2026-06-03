from ai.rag.chain import answer_question
from backend.api.schemas.response import ChatResponse, Source
from backend.api.schemas.request import Message

class ChatService:
    @staticmethod
    def get_answer(question: str, history: list[Message] = None) -> ChatResponse:
        history_dicts = [msg.model_dump() for msg in history] if history else []
        result = answer_question(question, history=history_dicts)
        
        sources = [Source(**source) for source in result["sources"]]
        
        return ChatResponse(
            answer=result["answer"],
            sources=sources,
            quick_replies=result.get("quick_replies", [])
        )
