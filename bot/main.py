import asyncio
import logging
import os
import re
from time import sleep
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

env = os.getenv("ENVIRONMENT", "local")
load_dotenv(dotenv_path=f'{env}.env')

TOKEN = os.getenv('BOT_TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL')


# ---------- helpers ----------
B64URL_RE = re.compile(r'^[A-Za-z0-9_-]{20,24}$')

def append_query(url: str, **params) -> str:
    """Безопасно добавляет/обновляет параметры query к URL."""
    parts = urlparse(url)
    q = dict(parse_qsl(parts.query, keep_blank_values=True))
    q.update({k: v for k, v in params.items() if v is not None})
    new_query = urlencode(q, doseq=True)
    return urlunparse(parts._replace(query=new_query))

def make_webapp_url(base_url: str, ref: str | None) -> str:
    """Добавляет ?ref=<token>, если токен валиден."""
    if ref and B64URL_RE.match(ref):
        return append_query(base_url, ref=ref)
    return base_url
# -----------------------------
try:
    bot = Bot(token=TOKEN)
except Exception as e:
    logger.error(f"BOT ERROR: {e}", exc_info=True)
    sleep(10000)

dp = Dispatcher()

WELCOME_TEXT = (
    "Привет! ❤️\n\n"
    "Это удобный бот с простой инструкцией для выгодных покупок с максимальным кешбэком\n\n"
    "<b>КАК ЭТО РАБОТАЕТ?</b>\n\n"
    "1️⃣ Выбирай товар из каталога  \n"
    "2️⃣ Открывай карточку и следуй шагам  \n"
    "3️⃣ Получай кешбэк и выгодные условия\n\n"
    "<b>ПОЧЕМУ МЫ?</b>\n\n"
    "😊 15 000+ довольных покупателей  \n"
    "🏳 Все продавцы проверены вручную  \n"
    "🫂 Поддержка 24/7 – поможем в любое время  \n"
    "📝 Реальные отзывы – убедись сам\n\n"
    "🔥 Все товары в каталоге ждут тебя!"
)

@dp.message(CommandStart(deep_link=True))
async def start_with_ref(message: types.Message, command: CommandObject):
    ref_token = command.args  # ожидаем b64url-токен, без легаси
    web_app_url = make_webapp_url(WEB_APP_URL, ref_token)

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть приложение 🛍", web_app=WebAppInfo(url=web_app_url))]
        ]
    )
    await message.answer(
        WELCOME_TEXT,
        reply_markup=keyboard,
        parse_mode="HTML",
        disable_web_page_preview=True,
    )

@dp.message(CommandStart())
async def start_plain(message: types.Message):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть приложение 🛍", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]
    )
    await message.answer(
        WELCOME_TEXT,
        reply_markup=keyboard,
        parse_mode="HTML",
        disable_web_page_preview=True,
    )

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
