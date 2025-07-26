import logging
import subprocess
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

import migrations
from dependencies.services.upload import get_upload_service
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
        "https://a19c-45-91-236-218.ngrok-free.app"
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
