import logging
import subprocess
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from middlewares.auth_middleware import check_for_auth
from routes import (
    router as api_router,
    user_router,
    moderator_router,
    orders_router,
    product_router,
    review_router,
    auth_router,

)
from settings import settings

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


@asynccontextmanager
async def lifespan(_) -> AsyncGenerator[None, None]:
    await apply_migrations()

    yield


app = FastAPI(lifespan=lifespan)

app.mount("/static/images", StaticFiles(directory="upload"), name="upload")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "http://localhost:3000",
        # "https://df07-45-15-159-88.ngrok-free.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
    allow_headers=["*"],
)
app.middleware('http')(check_for_auth)

app.include_router(api_router)
# app.include_router(product_router)
# app.include_router(user_router)
# app.include_router(orders_router)
# app.include_router(review_router)
# app.include_router(auth_router)
# app.include_router(moderator_router)

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)



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


print(settings.bot.token)
