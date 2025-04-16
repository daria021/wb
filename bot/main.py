import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.deep_linking import decode_payload
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
    # logger.info(type(args))
    # payload = decode_payload(args)
    web_app_url = WEB_APP_URL
    if arg:
        web_app_url += f"?ref={arg}"

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Open Mini App", web_app=WebAppInfo(url=web_app_url))]
        ]
    )

    await message.answer("Welcome! Click below to open the Mini App.", reply_markup=keyboard)

@dp.message(CommandStart())
async def start(message: types.Message):
    """Handles the /start command and sends a Mini App button with a UUID query parameter, if provided."""
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Open Mini App", web_app=WebAppInfo(url=WEB_APP_URL))]
        ]
    )

    await message.answer("Welcome! Click below to open the Mini App.", reply_markup=keyboard)


async def main():
    """Run the bot."""
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
