from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models import Goal, Task
import os

async def get_database():
    """
    Create a fresh database connection for each request
    This is required for serverless environments like Vercel
    """
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME", "smart_task_planner")
    
    if not mongodb_url:
        raise ValueError("MONGODB_URL environment variable not set")
    
    # Create a fresh client for this request
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    # Initialize Beanie with the database
    await init_beanie(database=db, document_models=[Goal, Task])
    
    return db, client
