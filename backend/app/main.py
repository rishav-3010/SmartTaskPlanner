from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import goals, tasks

# NO lifespan context manager for serverless!
app = FastAPI(
    title="Smart Task Planner API",
    description="AI-powered task breakdown and planning system",
    version="1.0.0"
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://smart-task-planner-tau.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(goals.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Smart Task Planner API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "goals": "/api/goals",
            "tasks": "/api/tasks"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "smart-task-planner"
    }
