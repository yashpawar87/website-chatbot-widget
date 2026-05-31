import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class AIConfig(BaseSettings):
    groq_api_key: str = ""
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    embedding_dim: int = 384
    llm_model: str = "llama-3.3-70b-versatile"
    chunk_size: int = 1000
    chunk_overlap: int = 150
    qdrant_path: str = "data/qdrant_index"
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    qdrant_collection_name: str = "website_knowledge"
    wordpress_url: str = "https://baellchen.com"
    
    # LangSmith tracing
    langchain_tracing_v2: str = "false"
    langchain_endpoint: str = "https://api.smith.langchain.com"
    langchain_api_key: str = ""
    langchain_project: str = "website_chatbot"

    class Config:
        env_file = ".env"
        extra = "ignore"

ai_config = AIConfig()

if ai_config.langchain_tracing_v2.lower() == "true":
    os.environ["LANGCHAIN_TRACING_V2"] = ai_config.langchain_tracing_v2
    os.environ["LANGCHAIN_ENDPOINT"] = ai_config.langchain_endpoint
    os.environ["LANGCHAIN_API_KEY"] = ai_config.langchain_api_key
    os.environ["LANGCHAIN_PROJECT"] = ai_config.langchain_project
