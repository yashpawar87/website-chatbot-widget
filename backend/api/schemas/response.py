from pydantic import BaseModel

class Source(BaseModel):
    title: str
    url: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[Source]
    quick_replies: list[str] = []
