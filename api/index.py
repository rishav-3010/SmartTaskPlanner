from fastapi import FastAPI
from mangum import Mangum
import sys
import os

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import your FastAPI app
from app.main import app

# Wrap for Vercel serverless
handler = Mangum(app, lifespan="off")

# Also export app for Vercel
def handler_func(event, context):
    return handler(event, context)
