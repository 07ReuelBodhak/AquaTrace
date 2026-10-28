from datetime import datetime, timezone, timedelta
from threading import Lock
from typing import Any, Dict, List, Optional
from backend.app.core.exceptions import NoDatasetError
from backend.app.models.schemas import (
    AnalysisResponse,
    DatasetMetadataResponse,
    SourceAnalysisResult,
    TimelineBucket,
    TimelineRangeResponse,
    WaterSourceInfo,
    WaterSourceStatus,
)
from backend.app.services.epi_engine import compute_contingency_matrix


class InMemoryDataStore:
    """Thread-safe state store for active outbreak investigation datasets."""

    def __init__(self):
        self._lock = Lock()
        self.dataset_id: Optional[str] = None
        self.records: List[Dict[str, Any]] = []
        self.source_ids: List[str] = []
        self.sources_registry: Dict[str, WaterSourceInfo] = {}
        self.min_timestamp: Optional[datetime] = None
        self.max_timestamp: Optional[datetime] = None

    def set_dataset(
        self,
        dataset_id: str,
        records: List[Dict[str, Any]],
        source_ids: List[str],
        registry: Optional[Dict[str, WaterSourceInfo]] = None,
    ) -> None:
        with self._lock:
            self.dataset_id = dataset_id
            self.records = records
            self.source_ids = source_ids

            timestamps = [r["recorded_at"] for r in records if r["recorded_at"]]
            self.min_timestamp = min(timestamps) if timestamps else None
            self.max_timestamp = max(timestamps) if timestamps else None

            # Build source registry
            self.sources_registry = {}
            for sid in source_ids:
                if registry and sid in registry:
                    self.sources_registry[sid] = registry[sid]
                else:
                    self.sources_registry[sid] = WaterSourceInfo(
                        source_id=sid,
                        source_name=sid.replace("_", " ").title(),
                        source_type="other",
                        status=WaterSourceStatus.UNDER_INVESTIGATION,
                    )

    def get_metadata(self) -> DatasetMetadataResponse:
        with self._lock:
            if not self.dataset_id or not self.records:
                raise NoDatasetError("No dataset is currently loaded in memory.")

            total_cases = sum(1 for r in self.records if r["is_ill"])
            total_records = len(self.records)
            overall_ar = (total_cases / total_records) if total_records > 0 else 0.0

            return DatasetMetadataResponse(
                dataset_id=self.dataset_id,
                total_records=total_records,
                total_cases=total_cases,
                overall_attack_rate=round(overall_ar, 4),
                source_ids=list(self.source_ids),
                min_timestamp=self.min_timestamp,
                max_timestamp=self.max_timestamp,
                sources=list(self.sources_registry.values()),
            )

    def calculate_at_cutoff(self, cutoff_timestamp: Optional[datetime]) -> AnalysisResponse:
        with self._lock:
            if not self.dataset_id or not self.records:
                raise NoDatasetError("No dataset has been loaded. Upload a dataset first.")

            # Default to maximum timestamp if none provided
            effective_cutoff = cutoff_timestamp or self.max_timestamp
            if not effective_cutoff:
                effective_cutoff = datetime.now(timezone.utc)

            # Strict Timeline Replay Slicing: recorded_at <= T (Zero future leakage)
            filtered_records = [
                r for r in self.records if r["recorded_at"] <= effective_cutoff
            ]

            total_evaluated = len(filtered_records)
            total_cases = sum(1 for r in filtered_records if r["is_ill"])
            overall_ar = (total_cases / total_evaluated) if total_evaluated > 0 else 0.0

            sources_results: List[SourceAnalysisResult] = []

            for sid in self.source_ids:
                a = 0
                b = 0
                c = 0
                d = 0

                for r in filtered_records:
                    is_exposed = r["exposures"].get(sid, False)
                    is_ill = r["is_ill"]
                    if is_exposed and is_ill:
                        a += 1
                    elif is_exposed and not is_ill:
                        b += 1
                    elif not is_exposed and is_ill:
                        c += 1
                    else:
                        d += 1

                table, metrics = compute_contingency_matrix(a=a, b=b, c=c, d=d)
                source_info = self.sources_registry.get(
                    sid,
                    WaterSourceInfo(source_id=sid, source_name=sid),
                )

                sources_results.append(
                    SourceAnalysisResult(
                        source_id=sid,
                        source_name=source_info.source_name,
                        source_type=source_info.source_type,
                        contingency_table=table,
                        risk_metrics=metrics,
                    )
                )

            # Sort sources by Relative Risk descending
            sources_results.sort(
                key=lambda x: (x.risk_metrics.relative_risk, x.risk_metrics.attack_rate_exposed),
                reverse=True,
            )

            return AnalysisResponse(
                cutoff_timestamp=effective_cutoff,
                total_records_evaluated=total_evaluated,
                total_cases=total_cases,
                overall_attack_rate=round(overall_ar, 4),
                sources=sources_results,
            )

    def get_timeline_range(self, step_hours: int = 6) -> TimelineRangeResponse:
        with self._lock:
            if not self.dataset_id or not self.records:
                raise NoDatasetError("No dataset loaded.")

            if not self.min_timestamp or not self.max_timestamp:
                return TimelineRangeResponse(
                    min_timestamp=None,
                    max_timestamp=None,
                    total_records=0,
                    step_hours=step_hours,
                    buckets=[],
                )

            buckets: List[TimelineBucket] = []
            curr = self.min_timestamp
            cum_cases = 0

            # Sort records chronologically
            sorted_records = sorted(self.records, key=lambda r: r["recorded_at"])

            while curr <= self.max_timestamp:
                bucket_end = curr + timedelta(hours=step_hours)
                bucket_records = [
                    r for r in sorted_records if curr <= r["recorded_at"] < bucket_end
                ]
                cases = sum(1 for r in bucket_records if r["is_ill"])
                well = sum(1 for r in bucket_records if not r["is_ill"])
                cum_cases += cases

                buckets.append(
                    TimelineBucket(
                        bucket_start=curr,
                        bucket_end=bucket_end,
                        cases=cases,
                        well=well,
                        cumulative_cases=cum_cases,
                    )
                )
                curr = bucket_end

            return TimelineRangeResponse(
                min_timestamp=self.min_timestamp,
                max_timestamp=self.max_timestamp,
                total_records=len(self.records),
                step_hours=step_hours,
                buckets=buckets,
            )


data_store = InMemoryDataStore()
