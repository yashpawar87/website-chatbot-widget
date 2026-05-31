# Dependencies for FastAPI dependency injection

def get_chat_service():
    from backend.api.services.chat_service import ChatService
    return ChatService()
