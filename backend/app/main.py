import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("assumption_check_ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    logger.info("Initializing database tables...")
    await init_db()
    logger.info(f"Assumption Check AI Backend started. Environment: {settings.ENVIRONMENT}. Demo mode: {settings.is_demo_mode}")
    yield
    # Shutdown
    logger.info("Assumption Check AI Backend shutting down...")

app = FastAPI(
    title="Assumption Check AI API",
    description="Intelligent platform for critical thinking, assumption detection, logical analysis, and decision verification.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.cors_origins_list
if "*" not in origins and "http://localhost:5173" not in origins:
    origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(router)

@app.get("/")
async def root():
    return {
        "project": "Assumption Check AI",
        "tagline": "Don't just assume. Analyze, verify, and decide.",
        "status": "operational",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal analytical engine error occurred. Please verify your input or check logs."}
    )
