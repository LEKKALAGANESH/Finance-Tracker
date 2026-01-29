from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # App settings
    app_name: str = "Finance Tracker API"
    debug: bool = False
    api_prefix: str = "/api/v1"

    # Supabase settings
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Gemini API settings
    gemini_api_key: str = ""

    # CORS settings
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
