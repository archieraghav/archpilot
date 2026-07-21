from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, auth
from app.core.config import get_settings
from app.core.logging import configure_logging, logger
from app.api.routes import health, auth, datasets
from app.api.routes import health, auth, datasets, chat, copilot


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()

    app = FastAPI(
        title="ArchPilot API",
        description="AI Business Intelligence Platform — backend API",
        version="0.1.0",
        debug=settings.debug,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(datasets.router, prefix="/api/v1")
    app.include_router(chat.router, prefix="/api/v1")
    app.include_router(copilot.router, prefix="/api/v1")

    @app.on_event("startup")
    async def on_startup() -> None:
        logger.info("ArchPilot backend starting up | environment=%s", settings.environment)

    return app


app = create_app()
