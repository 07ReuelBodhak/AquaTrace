from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ----------------- Investigation Models -----------------
class InvestigationCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=150)
    geographic_area: str = Field(..., min_length=2, max_length=150)
    notes: Optional[str] = None

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    geographic_area: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class Investigation(BaseModel):
    investigation_id: str
    title: str
    geographic_area: str
    notes: Optional[str] = None
    status: str = "active"
    created_at: str
    updated_at: str
    latest_dataset_version: int = 0

# ----------------- CSV Validation Models -----------------
class ValidationErrorItem(BaseModel):
    row: Optional[int] = None
    field: Optional[str] = None
    message: str

class ValidationWarningItem(BaseModel):
    row: Optional[int] = None
    field: Optional[str] = None
    message: str

class CSVValidationResponse(BaseModel):
    is_valid: bool
    total_rows: int
    accepted_rows: int
    rejected_rows: int
    warned_rows: int
    detected_sources: List[str]
    errors: List[ValidationErrorItem]
    warnings: List[ValidationWarningItem]
    preview_rows: List[Dict[str, Any]]
    dataset_fingerprint: str

class DatasetImportRequest(BaseModel):
    investigation_id: str
    data_origin: Optional[str] = "Health Officer Survey CSV"
    records: List[Dict[str, Any]]

class DatasetVersionInfo(BaseModel):
    version: int
    investigation_id: str
    uploaded_at: str
    record_count: int
    data_origin: str
    detected_sources: List[str]
    warnings_count: int

# ----------------- Statistical & Analysis Models -----------------
class ConfidenceInterval(BaseModel):
    lower: float
    upper: float

class SourceComparison(BaseModel):
    source_id: str
    source_name: str
    source_type: Optional[str] = "Water Source"
    coordinates: Optional[Dict[str, float]] = None # {"lat": ..., "lng": ...}
    is_synthetic_coordinates: bool = False
    
    # 2x2 Table
    exposed_ill: int
    exposed_not_ill: int
    exposed_denominator: int
    exposed_attack_rate: Optional[float] = None
    exposed_attack_rate_pct: Optional[str] = None
    
    unexposed_ill: int
    unexposed_not_ill: int
    unexposed_denominator: int
    unexposed_attack_rate: Optional[float] = None
    unexposed_attack_rate_pct: Optional[str] = None
    
    unknown_exposure_count: int = 0
    
    # Epidemiological measures
    relative_risk: Optional[float] = None
    confidence_interval_95: Optional[ConfidenceInterval] = None
    ci_calculable: bool = False
    ci_limitation_reason: Optional[str] = None
    
    # Transparent Candidate Priority
    candidate_priority: str
    priority_level: Optional[str] = None
    priority_reason: str
    data_sufficiency: str
    limitations: List[str] = []

class CurrentDatasetResponse(BaseModel):
    investigation_id: str
    title: str
    geographic_area: Optional[str] = None
    status: str = "active"
    latest_dataset_version: int
    total_records: int
    detected_sources: List[str] = Field(default_factory=list)

class AnalysisResponse(BaseModel):
    investigation_id: str
    dataset_version: int
    calculated_at: str
    timeline_cutoff: Optional[str] = None
    is_timeline_filtered: bool = False
    total_records: int
    eligible_records: int
    ill_count: int
    not_ill_count: int
    unknown_illness_count: int
    sources: List[SourceComparison]
    methodology_note: str = "Deterministic 2x2 contingency matrix with log-RR 95% Wald CI"
    statistical_method_version: str = "1.0.0-deterministic"

# ----------------- Task / Response Planner Models -----------------
class TaskItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_role: Optional[str] = None
    priority: str = "medium" # "high", "medium", "low"
    due_date: Optional[str] = None
    associated_source_id: Optional[str] = None

class TaskItem(BaseModel):
    task_id: str
    investigation_id: str
    title: str
    description: Optional[str] = None
    assigned_role: Optional[str] = None
    priority: str = "medium"
    status: str = "pending" # "pending", "in_progress", "completed"
    due_date: Optional[str] = None
    associated_source_id: Optional[str] = None
    completion_notes: Optional[str] = None
    created_at: str
    updated_at: str

class TaskItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_role: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    completion_notes: Optional[str] = None

# ----------------- Auth Models (TASK-03) -----------------
class LoginRequest(BaseModel):
    badge_id: str = Field(..., min_length=2, max_length=50)
    pin: Optional[str] = None

class AuthSessionResponse(BaseModel):
    authenticated: bool
    officer_badge: str
    officer_name: str
    role: str
    jurisdiction: str
    session_token: str
    login_time: str

# ----------------- Epicurve & Timeline Range (TASK-03) -----------------
class EpicurveBucket(BaseModel):
    timestamp: str
    date_label: str
    case_count: int
    cumulative_cases: int
    survey_count: int

class TimelineRangeResponse(BaseModel):
    investigation_id: str
    dataset_version: int
    earliest_timestamp: Optional[str]
    latest_timestamp: Optional[str]
    total_records: int
    total_cases: int
    buckets: List[EpicurveBucket]
