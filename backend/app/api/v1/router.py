from fastapi import APIRouter
from backend.app.api.v1.endpoints import analysis, datasets, health

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(datasets.router)
api_router.include_router(analysis.router)
