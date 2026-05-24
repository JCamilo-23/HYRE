import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes import (
    interview_engine,
    jobs,
    simulations,
    copilot,
    video_analysis,
    billing,
    webhooks,
    work_simulator,
)

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO))

app = FastAPI(title="Hyre API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    interview_engine.router,
    prefix="/api/v1/interviews",
    tags=["interview-engine"],
)
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(simulations.router, prefix="/api/v1/simulations", tags=["simulations"])
app.include_router(copilot.router, prefix="/api/v1/copilot", tags=["copilot"])
app.include_router(video_analysis.router, prefix="/api/v1/video", tags=["video"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["billing"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(
    work_simulator.router,
    prefix="/api/v1/work-simulator",
    tags=["work-simulator"],
)


@app.get("/")
def root():
    return {
        "service": "HYRE API",
        "status": "ok",
        "health": "/health",
        "docs": "/docs",
        "interview_engine": "/api/v1/interviews/health",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
