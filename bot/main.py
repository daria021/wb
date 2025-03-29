import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv(dotenv_path=f'{os.getenv("ENVIRONMENT", "local")}.env')

TOKEN = os.getenv('TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL')

# Configure logging
logging.basicConfig(level=logging.INFO)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Initialize bot and dispatcher
bot = Bot(token=TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: types.Message):
    """Handles the /start command and sends a Mini App button."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Open Mini App", web_app=WebAppInfo(url=WEB_APP_URL))]]
    )

    await message.answer("Welcome! Click below to open the Mini App.", reply_markup=keyboard)


async def main():
    """Run the bot."""
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
