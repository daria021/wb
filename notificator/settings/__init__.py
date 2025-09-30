import os
from pathlib import Path
from typing import Type, Tuple

from pydantic import SecretStr, Field
from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict,
    PydanticBaseSettingsSource,
)

from .merged_source import MergedSettingsSource


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


class BotTokenSettings(BaseSettings):
    local: str
    dev: str = Field(..., alias="BOT_TOKEN")

    @property
    def token(self) -> str:
        match os.getenv("ENVIRONMENT", "local"):
            case "dev":
                return self.dev
            case "local":
                return self.local


class Settings(BaseSettings):
    db: DBSettings

    bot: BotTokenSettings

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
