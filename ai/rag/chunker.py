from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from ai.config import ai_config

def get_chunker() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=ai_config.chunk_size,
        chunk_overlap=ai_config.chunk_overlap
    )

def chunk_documents(documents: list[Document]) -> list[Document]:
    chunker = get_chunker()
    return chunker.split_documents(documents)
