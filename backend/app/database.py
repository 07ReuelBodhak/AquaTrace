import logging
import re
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.core.config import settings

logger = logging.getLogger("aquatrace.database")

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_instance = Database()

async def connect_to_mongo():
    try:
        db_instance.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=2000
        )
        db_instance.db = db_instance.client[settings.MONGODB_DATABASE]
        # Test connection
        await db_instance.client.admin.command('ping')
        sanitized_uri = re.sub(r"://([^:]+):([^@]+)@", "://***:***@", settings.MONGODB_URI)
        logger.info(f"Connected to MongoDB at {sanitized_uri}, database: {settings.MONGODB_DATABASE}")
        
        # Initialize indexes
        await init_db_indexes(db_instance.db)
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e}. AquaTrace will run with memory fallback/limited persistence.")

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

def get_database() -> AsyncIOMotorDatabase:
    return db_instance.db

async def init_db_indexes(db: AsyncIOMotorDatabase):
    try:
        # Investigations index
        await db.investigations.create_index("investigation_id", unique=True)
        # Datasets index
        await db.datasets.create_index([("investigation_id", 1), ("version", 1)], unique=True)
        # Participant records index
        await db.participant_records.create_index([("dataset_id", 1), ("participant_id", 1)])
        await db.participant_records.create_index([("dataset_id", 1), ("recorded_at", 1)])
        # Tasks index
        await db.tasks.create_index([("investigation_id", 1), ("task_id", 1)])
        logger.info("MongoDB indexes verified.")
    except Exception as e:
        logger.warning(f"Could not initialize MongoDB indexes: {e}")
