import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import logger
from app.seed.seed_data import seed_database
from app.routers import (
    meetings,
    transcripts,
    summaries,
    action_items,
    tags,
    comments,
    search,
    ask,
    export,
    users,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run seed on startup to ensure demo data exists
    logger.info("Starting Fireflies API server...")
    seed_database()
    yield
    logger.info("Shutting down Fireflies API server...")


app = FastAPI(
    title="Fireflies.ai Clone API",
    description="Meeting notes and transcription platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static media directory
media_path = os.path.abspath(settings.media_storage_path)
os.makedirs(media_path, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_path), name="media")

# Register all API routers under /api/v1
API_PREFIX = "/api/v1"

app.include_router(meetings.router, prefix=API_PREFIX)
app.include_router(transcripts.router, prefix=API_PREFIX)
app.include_router(summaries.router, prefix=API_PREFIX)
app.include_router(action_items.router, prefix=API_PREFIX)
app.include_router(tags.router, prefix=API_PREFIX)
app.include_router(comments.router, prefix=API_PREFIX)
app.include_router(search.router, prefix=API_PREFIX)
app.include_router(ask.router, prefix=API_PREFIX)
app.include_router(export.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {
        "name": "Fireflies.ai Clone API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
