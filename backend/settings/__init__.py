import os
from pathlib import Path
from uuid import UUID

from pydantic import SecretStr, Field
from pydantic_settings import (
    SettingsConfigDict,
)

from .abstract import AbstractSettings
from .merged_source import MergedSettingsSource

ENV = os.getenv("ENVIRONMENT", "local")


class WebAppSettings(AbstractSettings):
    url: str
    system_user_id: UUID


class DBSettings(AbstractSettings):
    host: str
    port: int
    name: str
    user: str
    password: SecretStr

    @property
    def url(self):
        return (
            f"postgresql+asyncpg://{self.user}:{self.password.get_secret_value()}@"
            f"{self.host}:{self.port}/{self.name}"
        )


class JwtSettings(AbstractSettings):
    secret_key: SecretStr
    issuer: str
    audience: str
    access_expire: int
    refresh_expire: int


class BotSettings(AbstractSettings):
    token: str = Field(..., alias="BOT_TOKEN")
    username: str = Field(..., alias="BOT_USERNAME")
    app_short_name: str
    channel_id: int = Field(..., alias="BOT_CHANNEL_ID")
    paid_topic_id: int = Field(..., alias="BOT_PAID_TOPIC_ID")
    free_topic_id: int = Field(..., alias="BOT_FREE_TOPIC_ID")


class Settings(AbstractSettings):
    db: DBSettings
    jwt: JwtSettings

    bot: BotSettings
    web: WebAppSettings

    debug: bool = True

    model_config = SettingsConfigDict(
        extra="ignore",
        json_file=Path(__file__).parent.parent / "settings.json",
        json_file_encoding="utf-8",
    )


settings = Settings()
