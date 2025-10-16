"""
Vercel Serverless handler for FastAPI backend
This file is the entry point for all /api/* requests on Vercel
"""

import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

# Import FastAPI app
from app.main import app

# Import Mangum for serverless adapter
from mangum import Mangum

# Create handler for Vercel
handler = Mangum(app, lifespan="off")