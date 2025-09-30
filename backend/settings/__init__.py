import os
from pathlib import Path
from typing import Type, Tuple
from uuid import UUID

from pydantic import SecretStr, Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
    PydanticBaseSettingsSource,
)

from .merged_source import MergedSettingsSource

ENV = os.getenv("ENVIRONMENT", "local")


class WebAppSettings(BaseSettings):
    url: str
    system_user_id: UUID


class DBSettings(BaseSettings):
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


class JwtSettings(BaseSettings):
    secret_key: SecretStr
    issuer: str
    audience: str
    access_expire: int
    refresh_expire: int


class BotTokenSettings(BaseSettings):
    token: str = Field(..., alias="BOT_TOKEN")
    username: str
    app_short_name: str
    channel_id: int
    paid_topic_id: int
    free_topic_id: int


class BotSettings(BaseSettings):
    local: BotTokenSettings
    dev: BotTokenSettings

    @property
    def token(self) -> str:
        match ENV:
            case "dev":
                return self.dev.token
            case "local":
                return self.local.token

    @property
    def username(self) -> str:
        match ENV:
            case "dev":
                return self.dev.username
            case "local":
                return self.local.username

    @property
    def channel_id(self) -> int:
        match ENV:
            case "dev":
                return self.dev.channel_id
            case "local":
                return self.local.channel_id

    @property
    def app_short_name(self) -> str:
        match ENV:
            case "dev":
                return self.dev.app_short_name
            case "local":
                return self.local.app_short_name

    @property
    def paid_topic_id(self) -> int:
        match ENV:
            case "dev":
                return self.dev.paid_topic_id
            case "local":
                return self.local.paid_topic_id

    @property
    def free_topic_id(self) -> int:
        match ENV:
            case "dev":
                return self.dev.free_topic_id
            case "local":
                return self.local.free_topic_id


class Settings(BaseSettings):
    db: DBSettings
    jwt: JwtSettings

    bot: BotSettings
    web: WebAppSettings

    debug: bool = True

    model_config = SettingsConfigDict(
        extra="ignore",
        json_file=Path(__file__).parent / "settings.json",
        json_file_encoding="utf-8",
    )

    @classmethod
    def settings_customise_sources(
            cls,
            settings_cls: Type[BaseSettings],
            init_settings: PydanticBaseSettingsSource,
            env_settings: PydanticBaseSettingsSource,
            dotenv_settings: PydanticBaseSettingsSource,
            file_secret_settings: PydanticBaseSettingsSource,
    ) -> Tuple[PydanticBaseSettingsSource, ...]:
        return (
            MergedSettingsSource(
                settings_cls,
                init_settings,
                env_settings,
                dotenv_settings,
                file_secret_settings,
            ),
        )


settings = Settings()
