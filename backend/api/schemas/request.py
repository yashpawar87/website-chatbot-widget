from pydantic import BaseModel, Field
from typing import List, Literal

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    question: str = Field(..., max_length=500)
    history: List[Message] = Field(default_factory=list, max_length=10)
