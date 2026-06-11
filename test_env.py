import os
from pydantic_settings import BaseSettings

os.environ["GROQ_API_KEY"] = "fake_key_from_env"

class AIConfig(BaseSettings):
    groq_api_key: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"

config = AIConfig()
print("Loaded Key:", config.groq_api_key)
