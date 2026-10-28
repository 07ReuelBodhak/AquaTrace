import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

try:
    from backend.app.database import get_database
    from backend.app.schemas.models import Investigation, TaskItem
except ImportError:
    from app.database import get_database
    from app.schemas.models import Investigation, TaskItem

# Fallback in-memory store if MongoDB is offline or in development
memory_store: Dict[str, Any] = {
    "investigations": {},
    "datasets": {}, # key: f"{inv_id}::v{version}" -> {"info": ..., "records": [...], "sources": [...]}
    "tasks": {}     # key: task_id -> TaskItem
}

async def save_investigation(inv: Investigation) -> Investigation:
    db = get_database()
    data = inv.model_dump()
    if db is not None:
        try:
            await db.investigations.update_one(
                {"investigation_id": inv.investigation_id},
                {"$set": data},
                upsert=True
            )
        except Exception:
            pass
    memory_store["investigations"][inv.investigation_id] = data
    return inv

async def get_investigation(inv_id: str) -> Optional[Investigation]:
    db = get_database()
    if db is not None:
        try:
            doc = await db.investigations.find_one({"investigation_id": inv_id}, {"_id": 0})
            if doc:
                return Investigation(**doc)
        except Exception:
            pass
    raw = memory_store["investigations"].get(inv_id)
    return Investigation(**raw) if raw else None

async def list_investigations() -> List[Investigation]:
    db = get_database()
    if db is not None:
        try:
            cursor = db.investigations.find({}, {"_id": 0}).sort("created_at", -1)
            docs = await cursor.to_list(length=100)
            if docs:
                return [Investigation(**d) for d in docs]
        except Exception:
            pass
    return [Investigation(**d) for d in memory_store["investigations"].values()]

async def save_dataset_version(
    inv_id: str,
    version: int,
    records: List[Dict[str, Any]],
    detected_sources: List[str],
    data_origin: str,
    warnings_count: int
) -> int:
    db = get_database()
    now_iso = datetime.now(timezone.utc).isoformat()
    record_count = len(records)
    
    meta = {
        "investigation_id": inv_id,
        "version": version,
        "uploaded_at": now_iso,
        "record_count": record_count,
        "data_origin": data_origin,
        "detected_sources": detected_sources,
        "warnings_count": warnings_count
    }
    
    if db is not None:
        try:
            await db.datasets.update_one(
                {"investigation_id": inv_id, "version": version},
                {"$set": {**meta, "records": records}},
                upsert=True
            )
            # update investigation latest version
            await db.investigations.update_one(
                {"investigation_id": inv_id},
                {"$set": {"latest_dataset_version": version, "updated_at": now_iso}}
            )
        except Exception:
            pass
            
    # Always keep in memory
    memory_store["datasets"][f"{inv_id}::v{version}"] = {
        "meta": meta,
        "records": records,
        "detected_sources": detected_sources
    }
    if inv_id in memory_store["investigations"]:
        memory_store["investigations"][inv_id]["latest_dataset_version"] = version
        memory_store["investigations"][inv_id]["updated_at"] = now_iso
        
    return version

async def get_dataset_version(inv_id: str, version: Optional[int] = None) -> Optional[Dict[str, Any]]:
    # If version is None, get latest
    inv = await get_investigation(inv_id)
    if not inv:
        return None
        
    v = version if version is not None else inv.latest_dataset_version
    if v <= 0:
        return None
        
    db = get_database()
    if db is not None:
        try:
            doc = await db.datasets.find_one({"investigation_id": inv_id, "version": v}, {"_id": 0})
            if doc:
                return {
                    "meta": {k: doc[k] for k in ["investigation_id", "version", "uploaded_at", "record_count", "data_origin", "detected_sources", "warnings_count"] if k in doc},
                    "records": doc.get("records", []),
                    "detected_sources": doc.get("detected_sources", [])
                }
        except Exception:
            pass
            
    return memory_store["datasets"].get(f"{inv_id}::v{v}")

async def list_dataset_versions(inv_id: str) -> List[Dict[str, Any]]:
    db = get_database()
    if db is not None:
        try:
            cursor = db.datasets.find(
                {"investigation_id": inv_id},
                {"_id": 0, "records": 0}
            ).sort("version", -1)
            docs = await cursor.to_list(length=50)
            if docs:
                return docs
        except Exception:
            pass
            
    versions = []
    prefix = f"{inv_id}::v"
    for k, v in memory_store["datasets"].items():
        if k.startswith(prefix):
            versions.append(v["meta"])
    versions.sort(key=lambda x: x["version"], reverse=True)
    return versions

# Tasks
async def save_task(task: TaskItem) -> TaskItem:
    db = get_database()
    data = task.model_dump()
    if db is not None:
        try:
            await db.tasks.update_one({"task_id": task.task_id}, {"$set": data}, upsert=True)
        except Exception:
            pass
    memory_store["tasks"][task.task_id] = data
    return task

async def list_tasks(inv_id: str) -> List[TaskItem]:
    db = get_database()
    if db is not None:
        try:
            cursor = db.tasks.find({"investigation_id": inv_id}, {"_id": 0}).sort("created_at", -1)
            docs = await cursor.to_list(length=100)
            if docs:
                return [TaskItem(**d) for d in docs]
        except Exception:
            pass
    tasks = [TaskItem(**t) for t in memory_store["tasks"].values() if t.get("investigation_id") == inv_id]
    tasks.sort(key=lambda x: x.created_at, reverse=True)
    return tasks
