import logging
import subprocess
from contextlib import asynccontextmanager
from asyncio import create_task, sleep
from datetime import datetime, timedelta
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

import migrations
from dependencies.services.upload import get_upload_service
from dependencies.services.order import get_order_service
from dependencies.services.notification import get_notification_service
from domain.dto import UpdateOrderDTO
from infrastructure.enums.order_status import OrderStatus
from middlewares.auth_middleware import check_for_auth
from routes import (
    router as api_router,
)

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


async def apply_migrations():
    migrations_is_ok = subprocess.call(["alembic", "upgrade", "head"]) == 0
    if not migrations_is_ok:
        logger.error("There is an error while upgrading database")
        exit(1)

    logger.info("Migrations applied, seeding...")

    try:
        await migrations.backfill()
    except Exception as e:
        logger.error("There is an error while seeding database", exc_info=e)
        exit(1)


@asynccontextmanager
async def lifespan(_) -> AsyncGenerator[None, None]:
    await apply_migrations()

    upload_service = get_upload_service()
    await upload_service.initialize()

    # Фоновая задача: напоминания и автокансел неактивных заказов
    async def inactivity_watcher():
        order_service = get_order_service()
        notification_service = get_notification_service()
        while True:
            try:
                # 1) cutoff для напоминания: 3 дня назад
                cutoff_reminder = datetime.now() - timedelta(days=3)
                repo = order_service.order_repository
                for order in await repo.get_inactive_orders(cutoff_reminder):
                    try:
                        await notification_service.send_order_progress_reminder(order.user_id, order.id)
                        # фиксируем REMINDER_SENT в истории
                        from dependencies.repositories.user_history import get_user_history_repository
                        from domain.dto.user_history import CreateUserHistoryDTO
                        from infrastructure.enums.action import Action
                        user_history_repository = get_user_history_repository()
                        await user_history_repository.create(CreateUserHistoryDTO(
                            user_id=order.user_id,
                            creator_id=None,
                            product_id=order.product_id,
                            action=Action.REMINDER_SENT,
                            date=datetime.now(),
                            json_before=None,
                            json_after=None,
                        ))
                    except Exception:
                        logging.exception("Failed to send reminder")

                # 2) cutoff для отмены: 4 дня назад (сутки после напоминания)
                cutoff_cancel = datetime.now() - timedelta(days=4)
                for order in await repo.get_inactive_after_reminder(cutoff_cancel):
                    try:
                        await order_service.update_order(order.id, UpdateOrderDTO(status=OrderStatus.CANCELLED))
                    except Exception:
                        logging.exception("Failed to cancel inactive order")
            except Exception:
                logging.exception("inactivity_watcher iteration failed")

            # выполнять раз в час
            await sleep(3600)

    create_task(inactivity_watcher())

    yield


app = FastAPI(lifespan=lifespan)

app.mount("/static/images", StaticFiles(directory="upload"), name="upload")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://8af6-45-150-33-208.ngrok-free.app",
        "https://b2a1-45-150-33-208.ngrok-free.app",
        "https://517e-45-150-33-208.ngrok-free.app",
        "https://a19c-45-91-236-218.ngrok-free.app",
        "https://a36564ef5569.ngrok-free.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
    allow_headers=["*"],
)
app.middleware('http')(check_for_auth)

app.include_router(api_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="WB BOT API",
        version="0.1.0",
        description="meow",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    openapi_schema["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
