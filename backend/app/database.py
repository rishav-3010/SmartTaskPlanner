from pymongo import AsyncMongoClient  # Changed from motor.motor_asyncio
from beanie import init_beanie
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB client instance
mongodb_client: AsyncMongoClient = None  # Changed type hint


async def connect_to_mongo():
    """Initialize MongoDB connection"""
    global mongodb_client
    
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "smart_task_planner")
    
    # Create MongoDB client (using PyMongo's AsyncMongoClient)
    mongodb_client = AsyncMongoClient(mongodb_url)
    
    # Import models here to avoid circular imports
    from app.models import Goal, Task
    
    # Initialize beanie with the database and models
    await init_beanie(
        database=mongodb_client[database_name],  # This stays the same
        document_models=[Goal, Task]
    )
    
    print(f"✅ Connected to MongoDB: {database_name}")


async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        print("❌ Closed MongoDB connection")
