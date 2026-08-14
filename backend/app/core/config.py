from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./fireflies.db"

    # LLM Configuration (Google Gemini)
    llm_provider: str = "gemini"
    gemini_api_key: Optional[str] = None
    llm_model: str = "gemini-flash-latest"
    llm_base_url: Optional[str] = "https://generativelanguage.googleapis.com/v1beta/openai/"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # File Storage
    media_storage_path: str = "./media"
    max_upload_mb: int = 25

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
