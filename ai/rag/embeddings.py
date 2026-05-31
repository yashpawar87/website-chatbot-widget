from langchain_huggingface import HuggingFaceEmbeddings
from ai.config import ai_config

def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(model_name=ai_config.embedding_model)
