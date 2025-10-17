from motor.motor_asyncio import AsyncIOMotorClient  # Fixed import
from beanie import init_beanie
import os

# Global variables for connection
mongodb_client = None
db_initialized = False

async def init_db():
    """Initialize MongoDB connection - called on each request in serverless"""
    global mongodb_client, db_initialized
    
    # Only initialize once per function instance
    if db_initialized:
        print("=== DEBUG: Database already initialized ===")
        return
    
    try:
        mongodb_url = os.getenv("MONGODB_URL")
        database_name = os.getenv("DATABASE_NAME", "smart_task_planner")
        
        print(f"=== DEBUG: Connecting to MongoDB (db: {database_name}) ===")
        
        if not mongodb_url:
            raise ValueError("MONGODB_URL environment variable not set")
        
        # Create MongoDB client
        mongodb_client = AsyncIOMotorClient(mongodb_url)
        
        # Import models
        from app.models import Goal, Task
        
        # Initialize beanie
        print("=== DEBUG: Initializing Beanie ===")
        await init_beanie(
            database=mongodb_client[database_name],
            document_models=[Goal, Task]
        )
        
        db_initialized = True
        print("=== DEBUG: Database initialized successfully! ===")
        
    except Exception as e:
        print(f"=== ERROR: Database initialization failed: {e} ===")
        raise

async def close_mongo_connection():
    """Close MongoDB connection (not used in serverless)"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
