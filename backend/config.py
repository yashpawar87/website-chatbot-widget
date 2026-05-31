from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class BackendConfig(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_url: str = "http://localhost:3000"
    cors_origins: list[str] = ["*"]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

backend_config = BackendConfig()
