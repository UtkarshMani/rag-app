import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import List, Dict

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")

# MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)
db = client["rag_app"]
collection = db["chat_history"]

async def save_chat(username: str, question: str, answer: str) -> str:
    """Save chat interaction to database"""
    chat_doc = {
        "username": username,
        "question": question, 
        "answer": answer,
        "timestamp": datetime.utcnow()
    }
    result = await collection.insert_one(chat_doc)
    return str(result.inserted_id)

async def get_chat_history(username: str, limit: int = 50) -> List[Dict]:
    """Get chat history for a user"""
    cursor = collection.find(
        {"username": username}
    ).sort("timestamp", -1).limit(limit)
    
    history = []
    async for doc in cursor:
        history.append({
            "question": doc["question"],
            "answer": doc["answer"],
            "timestamp": doc["timestamp"].isoformat()
        })
    
    return list(reversed(history))  # Return in chronological order

async def delete_chat_history(username: str) -> int:
    """Delete all chat history for a user"""
    result = await collection.delete_many({"username": username})
    return result.deleted_count

async def get_recent_conversations(limit: int = 10) -> List[Dict]:
    """Get recent conversations across all users (admin feature)"""
    cursor = collection.find().sort("timestamp", -1).limit(limit)
    
    conversations = []
    async for doc in cursor:
        conversations.append({
            "username": doc["username"],
            "question": doc["question"],
            "answer": doc["answer"],
            "timestamp": doc["timestamp"].isoformat()
        })
    
    return conversations
