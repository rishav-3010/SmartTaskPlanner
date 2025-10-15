from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import connect_to_mongo, close_mongo_connection
from app.routes import goals, tasks

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for FastAPI app
    Handles startup and shutdown
    """
    # Startup
    print("🚀 Starting Smart Task Planner API...")
    await connect_to_mongo()
    print("✅ API is ready!")
    
    yield
    
    # Shutdown
    print("👋 Shutting down...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="Smart Task Planner API",
    description="AI-powered task breakdown and planning system",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],  # Add multiple origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(goals.router)
app.include_router(tasks.router)


@app.get("/")
async def root():
    """Root endpoint"""
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
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "smart-task-planner"
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True  # Auto-reload on code changes
    )