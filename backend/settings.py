import os
from pathlib import Path
from typing import Type, Tuple

from pydantic import SecretStr
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
    PydanticBaseSettingsSource,
    JsonConfigSettingsSource,
)

ENV = os.getenv("ENVIRONMENT", "local")


class WebAppSettings(BaseSettings):
    url: str

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
    token: str
    username: str
    app_short_name: str
    channel_id: int


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
            JsonConfigSettingsSource(settings_cls),  # Fallback to JSON
        )


settings = Settings()
