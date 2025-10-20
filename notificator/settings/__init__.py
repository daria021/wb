import os
from pathlib import Path

from pydantic import SecretStr, Field
from pydantic_settings import (
    SettingsConfigDict,
)

from .abstract import AbstractSettings
from .merged_source import MergedSettingsSource


class DBSettings(AbstractSettings):
    host: str = Field(..., alias="DB_HOST")
    port: int = Field(..., alias="DB_PORT")
    name: str = Field(..., alias="DB_NAME")
    user: str = Field(..., alias="DB_USER")
    password: SecretStr = Field(..., alias="DB_PASSWORD")

    @property
    def url(self):
        return (
            f"postgresql+asyncpg://{self.user}:{self.password.get_secret_value()}@"
            f"{self.host}:{self.port}/{self.name}"
        )


class BotTokenSettings(AbstractSettings):
    local: str
    dev: str = Field(..., alias="BOT_TOKEN")

    @property
    def token(self) -> str:
        match os.getenv("ENVIRONMENT", "local"):
            case "dev":
                return self.dev
            case "local":
                return self.local


class Settings(AbstractSettings):
    db: DBSettings

    bot: BotTokenSettings

    debug: bool = True

    model_config = SettingsConfigDict(
        extra="ignore",
        json_file=Path(__file__).parent.parent / "settings.json",
        json_file_encoding="utf-8",
    )


settings = Settings()
