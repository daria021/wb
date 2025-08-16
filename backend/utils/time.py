from datetime import datetime
from zoneinfo import ZoneInfo

MSK = ZoneInfo("Europe/Moscow")

def now_msk_naive() -> datetime:
    return datetime.now(MSK).replace(tzinfo=None)