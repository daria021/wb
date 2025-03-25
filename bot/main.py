import asyncio
import logging

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

TOKEN = "7782070677:AAHtu78aPEQSf15dYsXJbBhcbfMoz7bDXQg"
WEB_APP_URL = "https://2b43-45-15-159-88.ngrok-free.app"  # Replace with your Mini App URL

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
