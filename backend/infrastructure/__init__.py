
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from settings import settings

__all__ = [
    "session_maker",
]


engine = create_async_engine(settings.db.url,
    pool_size=20,          # стартовый размер
    max_overflow=40,       # «долить» при пике
    pool_timeout=10,       # ждать не 30 с, а 10 с
    pool_recycle=1800,     # сбрасывать висящие коннекты
    pool_pre_ping=True,    # проверять «живость» соединения
)
session_maker = async_sessionmaker(engine, expire_on_commit=False)
