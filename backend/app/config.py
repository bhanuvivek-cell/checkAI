import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    ENVIRONMENT: str = Field(default="development", description="Environment mode")
    PORT: int = Field(default=8000, description="Port number")
    HOST: str = Field(default="0.0.0.0", description="Host address")
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
        description="Comma-separated allowed origins"
    )
    
    # AI settings
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API Key")
    OPENAI_MODEL: str = Field(default="gpt-4o-mini", description="Configured OpenAI Model")
    
    # Search settings
    SEARCH_API_KEY: str = Field(default="", description="Optional search provider API key")
    
    # Database
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./assumption_check.db",
        description="Async Database connection URL"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_demo_mode(self) -> bool:
        return not bool(self.OPENAI_API_KEY and self.OPENAI_API_KEY.strip())

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
