from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- App ---
    environment: str = "development"
    debug: bool = True
    secret_key: str = "changeme_generate_a_random_secret"

    # --- Database ---
    database_url: str = "postgresql+psycopg2://user:password@host/dbname"

    # --- Auth ---
    jwt_secret_key: str = "changeme_generate_a_random_secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    # --- AI Providers ---
    gemini_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    default_llm_provider: str = "gemini"

    # --- CORS ---
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()