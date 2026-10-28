from typing import Optional
from fastapi import APIRouter, Query
from backend.app.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    TimelineRangeResponse,
)
from backend.app.services.data_store import data_store

router = APIRouter()


@router.post("/analysis/calculate", response_model=AnalysisResponse, tags=["Analysis"])
async def calculate_analysis(request: Optional[AnalysisRequest] = None):
    """
    Calculates deterministic 2x2 contingency tables, attack rates, relative risk,
    Wald 95% confidence intervals, and priority ranking for cutoff timestamp T.
    Strictly excludes all records recorded after T.
    """
    cutoff = request.cutoff_timestamp if request else None
    return data_store.calculate_at_cutoff(cutoff_timestamp=cutoff)


@router.get("/analysis/timeline-range", response_model=TimelineRangeResponse, tags=["Analysis"])
async def get_timeline_range(
    step_hours: int = Query(default=6, ge=1, le=168, description="Time bucket interval in hours")
):
    """
    Returns temporal outbreak bounds and epicurve distribution buckets.
    """
    return data_store.get_timeline_range(step_hours=step_hours)
