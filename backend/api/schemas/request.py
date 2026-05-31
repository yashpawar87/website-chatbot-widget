from pydantic import BaseModel, Field
from typing import List

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    question: str = Field(..., max_length=500)
    history: List[Message] = Field(default_factory=list, max_length=10)
