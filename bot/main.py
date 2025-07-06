import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv(dotenv_path=f'{os.getenv("ENVIRONMENT", "local")}.env')

TOKEN = os.getenv('TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Initialize bot and dispatcher
bot = Bot(token=TOKEN)
dp = Dispatcher()

logger = logging.getLogger(__name__)

@dp.message(CommandStart(deep_link=True))
async def handler(message: types.Message, command: CommandObject):
    arg = command.args
    web_app_url = WEB_APP_URL
    if arg:
        web_app_url += f"?ref={arg}"

    instruction_url = f"{WEB_APP_URL}/instruction"
    text = (
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
        f"✅ <a href=\"{instruction_url}\">Инструкция здесь</a>\n\n"
        "🔥 Все товары в каталоге ждут тебя!"
    )

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть приложение 🛍", web_app=WebAppInfo(url=web_app_url))]
        ]
    )

    await message.answer(
        text,
        reply_markup=keyboard,
        parse_mode="HTML",
        disable_web_page_preview=True,
    )


@dp.message(CommandStart())
async def start(message: types.Message):
    instruction_url = f"{WEB_APP_URL}/instruction"
    text = (
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
        f"✅ <a href=\"{instruction_url}\">Инструкция здесь</a>\n\n"
        "🔥 Все товары в каталоге ждут тебя!"
    )

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть приложение 🛍", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]
    )

    await message.answer(
        text,
        reply_markup=keyboard,
        parse_mode="HTML",
        disable_web_page_preview=True,
    )


async def main():
    """Run the bot."""
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
