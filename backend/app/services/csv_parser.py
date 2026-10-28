import csv
import io
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple
from backend.app.core.exceptions import DataParseError, InvalidCSVHeaderError
from backend.app.models.schemas import WaterSourceInfo, WaterSourceStatus


def _parse_iso_datetime(date_str: str, row_num: int, col_name: str) -> datetime:
    """Parses standard ISO 8601 timestamps."""
    clean_str = date_str.strip()
    if not clean_str:
        raise DataParseError(
            f"Row {row_num}: Column '{col_name}' contains an empty date string."
        )
    if clean_str.endswith("Z"):
        clean_str = clean_str[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(clean_str)
    except Exception as exc:
        raise DataParseError(
            f"Row {row_num}: Invalid ISO 8601 datetime '{date_str}' in column '{col_name}'."
        ) from exc


def _parse_boolean(val: Any, row_num: int, col_name: str) -> bool:
    """Normalizes illness or exposure indicators into boolean."""
    s = str(val).strip().lower()
    if s in ("1", "ill", "true", "yes", "case", "y"):
        return True
    if s in ("0", "well", "false", "no", "control", "n"):
        return False
    raise DataParseError(
        f"Row {row_num}: Invalid boolean/status value '{val}' in column '{col_name}'."
    )


def parse_field_investigation_csv(
    content: str,
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """
    Parses field_investigation.csv strictly per Section 2.1 of api-contract.md.
    Returns:
      (list of validated participant record dictionaries, list of candidate source IDs)
    """
    if not content.strip():
        raise DataParseError("The provided field investigation CSV file is empty.")

    reader = csv.DictReader(io.StringIO(content))
    fieldnames = [f.strip() for f in (reader.fieldnames or [])]

    # Required base headers
    required_base = {"participant_id", "illness_status", "recorded_at"}
    missing_base = required_base - set(fieldnames)
    if missing_base:
        raise InvalidCSVHeaderError(
            f"Field investigation CSV is missing required columns: {sorted(list(missing_base))}"
        )

    # Detect dynamic source exposure columns
    source_cols = [f for f in fieldnames if f.endswith("_exposure")]
    if not source_cols:
        raise InvalidCSVHeaderError(
            "Field investigation CSV must contain at least one '<source_id>_exposure' column."
        )

    # Extract clean source IDs
    source_ids = [col[: -len("_exposure")] for col in source_cols]

    records: List[Dict[str, Any]] = []
    seen_participant_ids: Set[str] = set()

    for idx, row in enumerate(reader, start=2):
        participant_id = row.get("participant_id", "").strip()
        if not participant_id:
            raise DataParseError(f"Row {idx}: 'participant_id' cannot be empty.")
        if participant_id in seen_participant_ids:
            raise DataParseError(f"Row {idx}: Duplicate participant_id '{participant_id}'.")
        seen_participant_ids.add(participant_id)

        is_ill = _parse_boolean(row.get("illness_status", ""), idx, "illness_status")
        recorded_at = _parse_iso_datetime(row.get("recorded_at", ""), idx, "recorded_at")

        onset_date: Optional[datetime] = None
        raw_onset = row.get("onset_date", "").strip()
        if raw_onset:
            onset_date = _parse_iso_datetime(raw_onset, idx, "onset_date")

        age: Optional[int] = None
        raw_age = row.get("age", "").strip()
        if raw_age:
            try:
                age_val = int(raw_age)
                if not (0 <= age_val <= 120):
                    raise ValueError()
                age = age_val
            except ValueError:
                raise DataParseError(f"Row {idx}: 'age' must be an integer between 0 and 120.")

        gender = row.get("gender", "").strip() or "Unknown"
        location_zone = row.get("location_zone", "").strip() or None

        exposures: Dict[str, bool] = {}
        for col, src_id in zip(source_cols, source_ids):
            raw_exp = row.get(col, "").strip()
            if not raw_exp:
                exposures[src_id] = False
            else:
                exposures[src_id] = _parse_boolean(raw_exp, idx, col)

        records.append({
            "participant_id": participant_id,
            "is_ill": is_ill,
            "recorded_at": recorded_at,
            "onset_date": onset_date,
            "age": age,
            "gender": gender,
            "location_zone": location_zone,
            "exposures": exposures,
        })

    if not records:
        raise DataParseError("The uploaded CSV contains valid headers but zero data rows.")

    return records, source_ids


def parse_water_source_registry_csv(content: str) -> Dict[str, WaterSourceInfo]:
    """
    Parses candidate water source registry CSV per Section 2.2 of api-contract.md.
    """
    if not content.strip():
        return {}

    reader = csv.DictReader(io.StringIO(content))
    fieldnames = [f.strip() for f in (reader.fieldnames or [])]

    required_headers = {"source_id", "source_name", "source_type", "status"}
    missing = required_headers - set(fieldnames)
    if missing:
        raise InvalidCSVHeaderError(
            f"Water source registry CSV missing required columns: {sorted(list(missing))}"
        )

    sources: Dict[str, WaterSourceInfo] = {}

    for idx, row in enumerate(reader, start=2):
        source_id = row.get("source_id", "").strip()
        if not source_id:
            raise DataParseError(f"Row {idx}: 'source_id' cannot be empty in water source registry.")

        source_name = row.get("source_name", "").strip()
        source_type = row.get("source_type", "other").strip()

        lat: Optional[float] = None
        raw_lat = row.get("latitude", "").strip()
        if raw_lat:
            try:
                lat = float(raw_lat)
            except ValueError:
                raise DataParseError(f"Row {idx}: Invalid latitude '{raw_lat}'.")

        lon: Optional[float] = None
        raw_lon = row.get("longitude", "").strip()
        if raw_lon:
            try:
                lon = float(raw_lon)
            except ValueError:
                raise DataParseError(f"Row {idx}: Invalid longitude '{raw_lon}'.")

        raw_status = row.get("status", "under_investigation").strip().lower()
        try:
            status = WaterSourceStatus(raw_status)
        except ValueError:
            status = WaterSourceStatus.UNDER_INVESTIGATION

        sources[source_id] = WaterSourceInfo(
            source_id=source_id,
            source_name=source_name or source_id,
            source_type=source_type,
            latitude=lat,
            longitude=lon,
            status=status,
        )

    return sources
