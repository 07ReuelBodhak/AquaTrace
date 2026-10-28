from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.app.services.statistical_engine import calculate_source_statistics
from backend.app.schemas.models import AnalysisResponse, SourceComparison

def parse_iso_datetime(dt_str: str) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        clean = dt_str.strip().replace("Z", "+00:00")
        if "T" in clean:
            dt = datetime.fromisoformat(clean)
        else:
            dt = datetime.strptime(clean, "%Y-%m-%d")
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None

def compute_timeline_analysis(
    investigation_id: str,
    dataset_version: int,
    records: List[Dict[str, Any]],
    detected_sources: List[str],
    timeline_cutoff: Optional[str] = None
) -> AnalysisResponse:
    """
    Computes epidemiological analysis strictly filtering by record.recorded_at <= cutoff.
    Prevents any future data leakage into historical snapshots.
    """
    cutoff_dt = parse_iso_datetime(timeline_cutoff) if timeline_cutoff else None
    
    eligible_records: List[Dict[str, Any]] = []
    
    for r in records:
        if cutoff_dt is None:
            eligible_records.append(r)
        else:
            rec_dt = parse_iso_datetime(r.get("recorded_at", ""))
            # If record has no valid recorded_at, it cannot be proven to exist prior to cutoff
            if rec_dt is not None and rec_dt <= cutoff_dt:
                eligible_records.append(r)

    # Participant level counts
    ill_count = 0
    not_ill_count = 0
    unknown_illness_count = 0
    
    for r in eligible_records:
        status = str(r.get("illness_status", "")).strip().lower()
        if status == "ill":
            ill_count += 1
        elif status == "not_ill":
            not_ill_count += 1
        else:
            unknown_illness_count += 1

    # Source calculations
    sources_res: List[SourceComparison] = []
    for s_id in detected_sources:
        s_comp = calculate_source_statistics(s_id, eligible_records)
        sources_res.append(s_comp)

    # Sort sources: High priority candidates first, then by relative risk descending
    def sort_key(s: SourceComparison):
        priority_rank = {
            "HIGH_PRIORITY_CANDIDATE": 4,
            "INCONCLUSIVE_EVIDENCE": 3,
            "REQUIRES_VERIFICATION": 2,
            "NO_OBSERVED_POSITIVE_ASSOCIATION": 1,
            "INSUFFICIENT_DATA": 0
        }.get(s.candidate_priority, 0)
        rr_val = s.relative_risk or 0.0
        return (priority_rank, rr_val)

    sources_res.sort(key=sort_key, reverse=True)

    now_iso = datetime.now(timezone.utc).isoformat()
    return AnalysisResponse(
        investigation_id=investigation_id,
        dataset_version=dataset_version,
        calculated_at=now_iso,
        timeline_cutoff=timeline_cutoff,
        is_timeline_filtered=(cutoff_dt is not None),
        total_records=len(records),
        eligible_records=len(eligible_records),
        ill_count=ill_count,
        not_ill_count=not_ill_count,
        unknown_illness_count=unknown_illness_count,
        sources=sources_res,
        methodology_note="Deterministic 2x2 contingency matrix with log-RR 95% Wald CI (Timeline Replay Filtered)",
        statistical_method_version="1.0.0-deterministic"
    )
