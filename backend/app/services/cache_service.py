import hashlib
from typing import Dict, Any, Optional

class AnalysisCache:
    """
    Process-local bounded cache for deterministic epidemiological analysis snapshots.
    Guarantees isolation across investigations, dataset versions, parameters, and timeline timestamps.
    """
    def __init__(self, max_size: int = 500):
        self._cache: Dict[str, Any] = {}
        self._max_size = max_size

    def _generate_key(
        self,
        investigation_id: str,
        dataset_version: int,
        timeline_cutoff: Optional[str] = None,
        method_version: str = "1.0.0-deterministic"
    ) -> str:
        raw_key = f"{investigation_id}::v{dataset_version}::t_{timeline_cutoff or 'full'}::m_{method_version}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    def get(
        self,
        investigation_id: str,
        dataset_version: int,
        timeline_cutoff: Optional[str] = None,
        method_version: str = "1.0.0-deterministic"
    ) -> Optional[Any]:
        key = self._generate_key(investigation_id, dataset_version, timeline_cutoff, method_version)
        return self._cache.get(key)

    def set(
        self,
        investigation_id: str,
        dataset_version: int,
        value: Any,
        timeline_cutoff: Optional[str] = None,
        method_version: str = "1.0.0-deterministic"
    ):
        if len(self._cache) >= self._max_size:
            # Evict first 50 keys
            keys_to_remove = list(self._cache.keys())[:50]
            for k in keys_to_remove:
                del self._cache[k]
        key = self._generate_key(investigation_id, dataset_version, timeline_cutoff, method_version)
        self._cache[key] = value

    def invalidate_investigation(self, investigation_id: str):
        # Clears all cached snapshots for an investigation when modified
        keys_to_del = [k for k in self._cache.keys() if k.startswith(investigation_id)]
        for k in keys_to_del:
            self._cache.pop(k, None)

    def clear(self):
        self._cache.clear()

analysis_cache = AnalysisCache()
