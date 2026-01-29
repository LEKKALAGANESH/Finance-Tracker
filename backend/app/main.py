from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Finance Tracker API...")
    yield
    # Shutdown
    print("Shutting down Finance Tracker API...")


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="API for Finance Tracker - Track expenses, manage budgets, and get AI insights",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    return {
        "message": "Welcome to Finance Tracker API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
