from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from ai.config import ai_config
from ai.rag.embeddings import get_embeddings

_qdrant_client = None
_vector_store = None

def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        if ai_config.qdrant_url:
            _qdrant_client = QdrantClient(
                url=ai_config.qdrant_url,
                api_key=ai_config.qdrant_api_key,
                timeout=60
            )
        else:
            import os
            os.makedirs(ai_config.qdrant_path, exist_ok=True)
            _qdrant_client = QdrantClient(path=ai_config.qdrant_path)
    return _qdrant_client

def get_vector_store() -> QdrantVectorStore:
    global _vector_store
    if _vector_store is None:
        client = get_qdrant_client()
        
        if not client.collection_exists(ai_config.qdrant_collection_name):
            client.create_collection(
                collection_name=ai_config.qdrant_collection_name,
                vectors_config=VectorParams(size=ai_config.embedding_dim, distance=Distance.COSINE),
            )
            
        embeddings = get_embeddings()
        _vector_store = QdrantVectorStore(
            client=client,
            collection_name=ai_config.qdrant_collection_name,
            embedding=embeddings
        )
    return _vector_store

def reset_collection():
    """Deletes and recreates the collection to prevent duplicates during re-indexing."""
    client = get_qdrant_client()
    if client.collection_exists(ai_config.qdrant_collection_name):
        client.delete_collection(ai_config.qdrant_collection_name)
    
    client.create_collection(
        collection_name=ai_config.qdrant_collection_name,
        vectors_config=VectorParams(size=ai_config.embedding_dim, distance=Distance.COSINE),
    )
    
    # Reset vector store instance so it picks up the fresh collection
    global _vector_store
    _vector_store = None
