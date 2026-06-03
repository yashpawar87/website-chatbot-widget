from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from ai.config import ai_config

def get_embeddings() -> FastEmbedEmbeddings:
    return FastEmbedEmbeddings(model_name=ai_config.embedding_model)
