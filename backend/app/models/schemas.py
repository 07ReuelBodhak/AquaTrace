from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PriorityStatus(str, Enum):
    HIGH_PRIORITY = "HIGH_PRIORITY"
    MODERATE_PRIORITY = "MODERATE_PRIORITY"
    LOW_PRIORITY = "LOW_PRIORITY"
    INSUFFICIENT_DATA = "INSUFFICIENT_DATA"


class WaterSourceStatus(str, Enum):
    ACTIVE = "active"
    RESTRICTED = "restricted"
    DECOMMISSIONED = "decommissioned"
    UNDER_INVESTIGATION = "under_investigation"


class ErrorPayload(BaseModel):
    code: str
    message: str
    details: List[Any] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: ErrorPayload


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str


class WaterSourceInfo(BaseModel):
    source_id: str
    source_name: str
    source_type: str = "other"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: WaterSourceStatus = WaterSourceStatus.UNDER_INVESTIGATION


class DatasetUploadResponse(BaseModel):
    dataset_id: str
    row_count: int
    source_ids: List[str]
    min_timestamp: Optional[datetime] = None
    max_timestamp: Optional[datetime] = None
    message: str


class DatasetMetadataResponse(BaseModel):
    dataset_id: str
    total_records: int
    total_cases: int
    overall_attack_rate: float
    source_ids: List[str]
    min_timestamp: Optional[datetime] = None
    max_timestamp: Optional[datetime] = None
    sources: List[WaterSourceInfo] = Field(default_factory=list)


class ContingencyTable(BaseModel):
    a: int = Field(description="Exposed Ill")
    b: int = Field(description="Exposed Well")
    c: int = Field(description="Unexposed Ill")
    d: int = Field(description="Unexposed Well")
    n_exposed: int = Field(description="Total Exposed (a + b)")
    n_unexposed: int = Field(description="Total Unexposed (c + d)")
    total: int = Field(description="Total Cohort (a + b + c + d)")
    zero_cell_corrected: bool = Field(description="True if Haldane-Anscombe 0.5 correction was applied")


class RiskMetrics(BaseModel):
    attack_rate_exposed: float
    attack_rate_unexposed: float
    attack_rate_overall: float
    relative_risk: float
    risk_difference: float
    population_attributable_fraction: float
    ci_lower: float
    ci_upper: float
    priority_status: PriorityStatus


class SourceAnalysisResult(BaseModel):
    source_id: str
    source_name: str
    source_type: str = "other"
    contingency_table: ContingencyTable
    risk_metrics: RiskMetrics


class AnalysisRequest(BaseModel):
    cutoff_timestamp: Optional[datetime] = Field(
        default=None,
        description="ISO 8601 cutoff timestamp T. Zero data leakage: only records with recorded_at <= T are included.",
    )


class AnalysisResponse(BaseModel):
    cutoff_timestamp: datetime
    total_records_evaluated: int
    total_cases: int
    overall_attack_rate: float
    sources: List[SourceAnalysisResult]


class TimelineBucket(BaseModel):
    bucket_start: datetime
    bucket_end: datetime
    cases: int
    well: int
    cumulative_cases: int


class TimelineRangeResponse(BaseModel):
    min_timestamp: Optional[datetime]
    max_timestamp: Optional[datetime]
    total_records: int
    step_hours: int
    buckets: List[TimelineBucket] = Field(default_factory=list)
