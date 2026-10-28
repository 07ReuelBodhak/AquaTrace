from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def get_health():
    """Returns service health status and API version."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version=settings.VERSION,
    )
