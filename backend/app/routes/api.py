import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Response
from backend.app.schemas.models import (
    Investigation, InvestigationCreate, InvestigationUpdate,
    CSVValidationResponse, AnalysisResponse, SourceComparison,
    TaskItem, TaskItemCreate, TaskItemUpdate, DatasetVersionInfo,
    CurrentDatasetResponse, LoginRequest, AuthSessionResponse,
    TimelineRangeResponse
)
from backend.app.storage import (
    save_investigation, get_investigation, list_investigations,
    save_dataset_version, get_dataset_version, list_dataset_versions,
    save_task, list_tasks
)
from backend.app.services.csv_validator import parse_and_validate_csv
from backend.app.services.timeline_engine import compute_timeline_analysis, compute_timeline_range_and_buckets
from backend.app.services.cache_service import analysis_cache
from backend.app.services.report_generator import generate_pdf_report
from backend.app.services.ai_explainer import generate_ai_explanation

router = APIRouter()

# ----------------- Health -----------------
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AquaTrace Backend API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "statistical_engine": "deterministic_v1"
    }

# ----------------- Officer Authentication (TASK-03) -----------------
@router.post("/auth/login", response_model=AuthSessionResponse)
async def login_officer(payload: LoginRequest):
    """
    Validates health officer badge identifier and returns active session.
    Provides standard test epidemiologist credentials for verification.
    """
    badge = payload.badge_id.strip()
    if not badge:
        raise HTTPException(status_code=400, detail="Badge ID is required")
        
    officer_name = "Dr. Eleanor Vance" if "741" in badge else f"Officer {badge}"
    token = f"AT-SESS-{uuid.uuid4().hex[:12].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    
    return AuthSessionResponse(
        authenticated=True,
        officer_badge=badge,
        officer_name=officer_name,
        role="Lead Field Epidemiologist",
        jurisdiction="Municipal Public Health Dept",
        session_token=token,
        login_time=now_iso
    )

@router.get("/auth/session", response_model=AuthSessionResponse)
async def get_session():
    now_iso = datetime.now(timezone.utc).isoformat()
    return AuthSessionResponse(
        authenticated=True,
        officer_badge="OFFICER-741",
        officer_name="Dr. Eleanor Vance",
        role="Lead Field Epidemiologist",
        jurisdiction="Municipal Public Health Dept",
        session_token="AT-SESS-DEFAULT-ACTIVE",
        login_time=now_iso
    )

# ----------------- Investigations -----------------
@router.get("/investigations", response_model=List[Investigation])
async def get_all_investigations():
    return await list_investigations()

@router.post("/investigations", response_model=Investigation)
async def create_new_investigation(payload: InvestigationCreate):
    now_iso = datetime.now(timezone.utc).isoformat()
    inv_id = f"INV-{uuid.uuid4().hex[:8].upper()}"
    inv = Investigation(
        investigation_id=inv_id,
        title=payload.title,
        geographic_area=payload.geographic_area,
        notes=payload.notes,
        status="active",
        created_at=now_iso,
        updated_at=now_iso,
        latest_dataset_version=0
    )
    return await save_investigation(inv)

@router.get("/investigations/{inv_id}", response_model=Investigation)
async def get_investigation_by_id(inv_id: str):
    inv = await get_investigation(inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@router.patch("/investigations/{inv_id}", response_model=Investigation)
async def update_investigation_metadata(inv_id: str, payload: InvestigationUpdate):
    inv = await get_investigation(inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(inv, field, val)
    inv.updated_at = datetime.now(timezone.utc).isoformat()
    analysis_cache.invalidate_investigation(inv_id)
    return await save_investigation(inv)

# ----------------- CSV Validation & Import -----------------
@router.post("/datasets/validate", response_model=CSVValidationResponse)
async def validate_csv_endpoint(file: UploadFile = File(...)):
    """
    Validates CSV headers, syntax, IDs, illness status, and exposure values.
    Returns preview and field/row error reports WITHOUT persisting.
    """
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Only CSV or formatted text files are supported.")
    
    content = await file.read()
    response, _ = parse_and_validate_csv(content, file.filename)
    return response

@router.post("/datasets/import")
async def import_csv_dataset(
    investigation_id: str = Form(...),
    data_origin: str = Form("Field Officer Survey"),
    file: UploadFile = File(...)
):
    """
    Validates and commits a confirmed dataset version to the investigation.
    """
    inv = await get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    content = await file.read()
    val_resp, accepted_records = parse_and_validate_csv(content, file.filename)
    
    if not val_resp.is_valid:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Dataset validation failed. Please address reported errors before importing.",
                "errors": [e.model_dump() for e in val_resp.errors]
            }
        )

    new_version = inv.latest_dataset_version + 1
    await save_dataset_version(
        inv_id=investigation_id,
        version=new_version,
        records=accepted_records,
        detected_sources=val_resp.detected_sources,
        data_origin=data_origin,
        warnings_count=val_resp.warned_rows
    )
    
    analysis_cache.invalidate_investigation(investigation_id)

    return {
        "status": "success",
        "investigation_id": investigation_id,
        "dataset_version": new_version,
        "records_imported": len(accepted_records),
        "detected_sources": val_resp.detected_sources,
        "warnings_count": val_resp.warned_rows
    }

# ----------------- Active Dataset & Candidate Sources (TASK-02) -----------------
@router.get("/datasets/current", response_model=CurrentDatasetResponse)
async def get_current_dataset_metadata():
    """
    Returns active/latest investigation and dataset metadata.
    Auto-initializes default municipal surveillance (INV-DEFAULT) if none exists.
    """
    investigations = await list_investigations()
    active_inv = None
    if investigations:
        active_inv = next((inv for inv in investigations if inv.status == "active"), investigations[0])
    
    if not active_inv:
        now_iso = datetime.now(timezone.utc).isoformat()
        active_inv = Investigation(
            investigation_id="INV-DEFAULT",
            title="Municipal Water Quality Surveillance",
            geographic_area="Metro Health Jurisdiction",
            notes="Default active municipal surveillance investigation",
            status="active",
            created_at=now_iso,
            updated_at=now_iso,
            latest_dataset_version=0
        )
        await save_investigation(active_inv)
    
    total_records = 0
    detected_sources: List[str] = []
    
    if active_inv.latest_dataset_version > 0:
        dataset = await get_dataset_version(active_inv.investigation_id, active_inv.latest_dataset_version)
        if dataset:
            meta = dataset.get("meta", {})
            total_records = meta.get("record_count", len(dataset.get("records", [])))
            detected_sources = dataset.get("detected_sources", [])
            
    return CurrentDatasetResponse(
        investigation_id=active_inv.investigation_id,
        title=active_inv.title,
        geographic_area=active_inv.geographic_area,
        status=active_inv.status,
        latest_dataset_version=active_inv.latest_dataset_version,
        total_records=total_records,
        detected_sources=detected_sources
    )


@router.get("/datasets/sources", response_model=List[SourceComparison])
async def get_dataset_sources(
    sort_by: Optional[str] = Query(None, description="Sort field: 'relative_risk', 'attack_rate', 'priority'"),
    order: Optional[str] = Query("desc", description="Sort order: 'desc', 'asc'"),
    priority_filter: Optional[str] = Query(None, description="Filter by candidate priority: 'HIGH', 'MEDIUM', 'LOW'"),
    timeline_cutoff: Optional[str] = Query(None, description="ISO timestamp cutoff for timeline replay"),
    investigation_id: Optional[str] = Query(None, description="Specific investigation ID (defaults to active)")
):
    """
    Returns the evaluated candidate water sources for active dataset with 2x2 counts, attack rates,
    relative risk, Wald 95% CI, and priority status. Supports sorting and priority filtering.
    """
    if investigation_id:
        inv = await get_investigation(investigation_id)
        if not inv:
            raise HTTPException(status_code=404, detail=f"Investigation '{investigation_id}' not found")
    else:
        investigations = await list_investigations()
        if investigations:
            inv = next((i for i in investigations if i.status == "active"), investigations[0])
        else:
            now_iso = datetime.now(timezone.utc).isoformat()
            inv = Investigation(
                investigation_id="INV-DEFAULT",
                title="Municipal Water Quality Surveillance",
                geographic_area="Metro Health Jurisdiction",
                notes="Default active municipal surveillance investigation",
                status="active",
                created_at=now_iso,
                updated_at=now_iso,
                latest_dataset_version=0
            )
            await save_investigation(inv)

    if inv.latest_dataset_version <= 0:
        return []

    dataset = await get_dataset_version(inv.investigation_id, inv.latest_dataset_version)
    if not dataset or not dataset.get("records"):
        return []

    analysis = compute_timeline_analysis(
        investigation_id=inv.investigation_id,
        dataset_version=inv.latest_dataset_version,
        records=dataset.get("records", []),
        detected_sources=dataset.get("detected_sources", []),
        timeline_cutoff=timeline_cutoff
    )

    sources = list(analysis.sources)

    if priority_filter:
        pf = priority_filter.strip().upper()
        def matches_priority(s: SourceComparison) -> bool:
            cand = s.candidate_priority.upper()
            level = (s.priority_level or "").upper()
            if pf in ("HIGH", "HIGH_PRIORITY", "HIGH_PRIORITY_CANDIDATE"):
                return level == "HIGH" or "HIGH" in cand
            elif pf in ("MEDIUM", "MODERATE", "INCONCLUSIVE", "REQUIRES_VERIFICATION"):
                return level == "MEDIUM" or "MEDIUM" in cand or "MODERATE" in cand or "INCONCLUSIVE" in cand or "VERIFICATION" in cand
            elif pf in ("LOW", "LOW_PRIORITY", "NO_OBSERVED_POSITIVE_ASSOCIATION", "INSUFFICIENT_DATA"):
                return level == "LOW" or "LOW" in cand or "NO_OBSERVED" in cand or "INSUFFICIENT" in cand
            return pf in cand or pf == level

        sources = [s for s in sources if matches_priority(s)]

    is_desc = (order or "desc").strip().lower() != "asc"

    def priority_score(s: SourceComparison) -> int:
        cand = s.candidate_priority.upper()
        level = (s.priority_level or "").upper()
        if level == "HIGH" or "HIGH" in cand:
            return 3
        if level == "MEDIUM" or "INCONCLUSIVE" in cand or "VERIFICATION" in cand or "MEDIUM" in cand:
            return 2
        if level == "LOW" or "NO_OBSERVED" in cand:
            return 1
        return 0

    if sort_by:
        sb = sort_by.strip().lower()
        if sb == "relative_risk":
            sources.sort(
                key=lambda s: (s.relative_risk if s.relative_risk is not None else (-1.0 if is_desc else 9999.0)),
                reverse=is_desc
            )
        elif sb in ("attack_rate", "exposed_attack_rate"):
            sources.sort(
                key=lambda s: (s.exposed_attack_rate if s.exposed_attack_rate is not None else (-1.0 if is_desc else 9999.0)),
                reverse=is_desc
            )
        elif sb == "priority":
            sources.sort(
                key=lambda s: priority_score(s),
                reverse=is_desc
            )
        else:
            sources.sort(
                key=lambda s: (
                    s.relative_risk if s.relative_risk is not None else -1.0,
                    s.exposed_attack_rate if s.exposed_attack_rate is not None else -1.0
                ),
                reverse=is_desc
            )
    else:
        sources.sort(
            key=lambda s: (
                s.relative_risk if s.relative_risk is not None else -1.0,
                s.exposed_attack_rate if s.exposed_attack_rate is not None else -1.0
            ),
            reverse=is_desc
        )

    return sources

@router.get("/datasets/{inv_id}/versions", response_model=List[DatasetVersionInfo])
async def get_dataset_versions_for_investigation(inv_id: str):
    inv = await get_investigation(inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    versions = await list_dataset_versions(inv_id)
    return [DatasetVersionInfo(**v) for v in versions]

# ----------------- Statistical Analysis & Timeline -----------------
@router.get("/analysis/{inv_id}", response_model=AnalysisResponse)
async def get_epidemiological_analysis(
    inv_id: str,
    version: Optional[int] = Query(None, description="Dataset version (defaults to latest)"),
    timeline_cutoff: Optional[str] = Query(None, description="ISO timestamp cutoff for timeline replay")
):
    """
    Authoritative deterministic epidemiological analysis endpoint.
    Computes 2x2 contingency matrix, attack rates, relative risk, and Wald 95% CIs.
    Utilizes versioned caching and strictly prevents future data leakage.
    """
    inv = await get_investigation(inv_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    ver = version or inv.latest_dataset_version
    if ver <= 0:
        raise HTTPException(status_code=400, detail="No dataset imported for this investigation yet.")

    # Check cache
    cached = analysis_cache.get(inv_id, ver, timeline_cutoff)
    if cached is not None:
        return cached

    dataset = await get_dataset_version(inv_id, ver)
    if not dataset:
        raise HTTPException(status_code=404, detail=f"Dataset version {ver} not found.")

    analysis = compute_timeline_analysis(
        investigation_id=inv_id,
        dataset_version=ver,
        records=dataset["records"],
        detected_sources=dataset["detected_sources"],
        timeline_cutoff=timeline_cutoff
    )

    # Save in bounded cache
    analysis_cache.set(inv_id, ver, analysis, timeline_cutoff)
    return analysis

@router.get("/analysis/timeline-range", response_model=TimelineRangeResponse)
@router.get("/analysis/{inv_id}/timeline-range", response_model=TimelineRangeResponse)
async def get_timeline_range(
    inv_id: Optional[str] = None,
    version: Optional[int] = Query(None),
    step_hours: int = Query(24, ge=1, le=168)
):
    """
    Returns the temporal bounds, total cases, and epicurve date buckets
    for the timeline scrubber and epidemic curve visualization.
    """
    if inv_id:
        inv = await get_investigation(inv_id)
        if not inv:
            raise HTTPException(status_code=404, detail="Investigation not found")
    else:
        investigations = await list_investigations()
        if investigations:
            inv = next((i for i in investigations if i.status == "active"), investigations[0])
        else:
            raise HTTPException(status_code=404, detail="No active investigation found")

    ver = version or inv.latest_dataset_version
    if ver <= 0:
        return TimelineRangeResponse(
            investigation_id=inv.investigation_id,
            dataset_version=0,
            earliest_timestamp=None,
            latest_timestamp=None,
            total_records=0,
            total_cases=0,
            buckets=[]
        )

    dataset = await get_dataset_version(inv.investigation_id, ver)
    if not dataset or not dataset.get("records"):
        return TimelineRangeResponse(
            investigation_id=inv.investigation_id,
            dataset_version=ver,
            earliest_timestamp=None,
            latest_timestamp=None,
            total_records=0,
            total_cases=0,
            buckets=[]
        )

    return compute_timeline_range_and_buckets(
        investigation_id=inv.investigation_id,
        dataset_version=ver,
        records=dataset["records"],
        step_hours=step_hours
    )

@router.get("/analysis/{inv_id}/source/{source_id}", response_model=SourceComparison)
async def get_source_drilldown(
    inv_id: str,
    source_id: str,
    version: Optional[int] = Query(None),
    timeline_cutoff: Optional[str] = Query(None)
):
    analysis = await get_epidemiological_analysis(inv_id, version, timeline_cutoff)
    matched = next((s for s in analysis.sources if s.source_id == source_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Source '{source_id}' not found in current analysis snapshot.")
    return matched

# ----------------- Reports -----------------
@router.get("/reports/{inv_id}/pdf")
@router.get("/reports/pdf")
async def export_investigation_brief_pdf(
    inv_id: Optional[str] = "current",
    version: Optional[int] = Query(None),
    timeline_cutoff: Optional[str] = Query(None)
):
    inv = None
    if inv_id in ("current", "active", "default", None):
        investigations = await list_investigations()
        if investigations:
            inv = next((i for i in investigations if i.status == "active"), investigations[0])
    else:
        inv = await get_investigation(inv_id)

    if not inv:
        # Create a default fallback investigation for demonstration
        now_iso = datetime.now(timezone.utc).isoformat()
        inv = Investigation(
            investigation_id="INV-METRO-01",
            title="Municipal Surveillance Outbreak Investigation",
            geographic_area="Metro Health Jurisdiction",
            notes="Active field survey",
            status="active",
            created_at=now_iso,
            updated_at=now_iso,
            latest_dataset_version=1
        )

    analysis = await get_epidemiological_analysis(inv.investigation_id, version, timeline_cutoff)
    pdf_bytes = generate_pdf_report(inv, analysis)
    
    filename = f"AquaTrace_Brief_{inv.investigation_id}_v{analysis.dataset_version}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# ----------------- AI Explainer (openai/gpt-oss-120b) -----------------
@router.post("/ai/explain/{inv_id}")
@router.post("/ai/explain")
async def get_ai_explanation(
    inv_id: Optional[str] = "current",
    version: Optional[int] = Query(None),
    timeline_cutoff: Optional[str] = Query(None)
):
    inv = None
    if inv_id in ("current", "active", "default", None):
        investigations = await list_investigations()
        if investigations:
            inv = next((i for i in investigations if i.status == "active"), investigations[0])
    else:
        inv = await get_investigation(inv_id)

    if not inv:
        now_iso = datetime.now(timezone.utc).isoformat()
        inv = Investigation(
            investigation_id="INV-METRO-01",
            title="Municipal Surveillance Outbreak Investigation",
            geographic_area="Metro Health Jurisdiction",
            notes="Active field survey",
            status="active",
            created_at=now_iso,
            updated_at=now_iso,
            latest_dataset_version=1
        )
        
    analysis = await get_epidemiological_analysis(inv.investigation_id, version, timeline_cutoff)
    return await generate_ai_explanation(analysis, inv.title)

# ----------------- Response Planner Tasks (TASK-05) -----------------
@router.get("/tasks/{inv_id}", response_model=List[TaskItem])
@router.get("/tasks", response_model=List[TaskItem])
async def get_tasks(inv_id: Optional[str] = "current"):
    target_id = inv_id
    if inv_id in ("current", "active", "default", None):
        investigations = await list_investigations()
        target_id = investigations[0].investigation_id if investigations else "INV-METRO-01"
    return await list_tasks(target_id)

@router.post("/tasks/{inv_id}", response_model=TaskItem)
@router.post("/tasks", response_model=TaskItem)
async def create_task(inv_id: Optional[str] = "current", payload: TaskItemCreate = ...):
    target_id = inv_id
    if inv_id in ("current", "active", "default", None):
        investigations = await list_investigations()
        target_id = investigations[0].investigation_id if investigations else "INV-METRO-01"
        
    now_iso = datetime.now(timezone.utc).isoformat()
    task = TaskItem(
        task_id=f"TASK-{uuid.uuid4().hex[:6].upper()}",
        investigation_id=target_id,
        title=payload.title,
        description=payload.description,
        assigned_role=payload.assigned_role or "Field Sampling Officer",
        priority=payload.priority,
        status="pending",
        due_date=payload.due_date,
        associated_source_id=payload.associated_source_id,
        created_at=now_iso,
        updated_at=now_iso
    )
    return await save_task(task)

@router.patch("/tasks/{inv_id}/{task_id}", response_model=TaskItem)
async def update_task(inv_id: str, task_id: str, payload: TaskItemUpdate):
    target_id = inv_id
    if inv_id in ("current", "active", "default"):
        investigations = await list_investigations()
        target_id = investigations[0].investigation_id if investigations else "INV-METRO-01"

    tasks = await list_tasks(target_id)
    t = next((item for item in tasks if item.task_id == task_id), None)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(t, k, v)
    t.updated_at = datetime.now(timezone.utc).isoformat()
    return await save_task(t)
