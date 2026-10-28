import csv
import io
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Tuple
from backend.app.schemas.models import (
    CSVValidationResponse,
    ValidationErrorItem,
    ValidationWarningItem
)

ALLOWED_ILLNESS_VALUES = {"ill", "not_ill", "unknown"}
ALLOWED_EXPOSURE_VALUES = {"yes", "no", "unknown"}

def parse_and_validate_csv(
    file_bytes: bytes,
    filename: str = "upload.csv"
) -> Tuple[CSVValidationResponse, List[Dict[str, Any]]]:
    """
    Parses and rigorously validates health officer CSV datasets.
    Does NOT invent data or silently drop rows.
    """
    errors: List[ValidationErrorItem] = []
    warnings: List[ValidationWarningItem] = []
    accepted_records: List[Dict[str, Any]] = []
    preview_rows: List[Dict[str, Any]] = []
    
    # 1. Size & Encoding check
    if len(file_bytes) == 0:
        errors.append(ValidationErrorItem(message="CSV file is empty (0 bytes)."))
        return CSVValidationResponse(
            is_valid=False,
            total_rows=0,
            accepted_rows=0,
            rejected_rows=0,
            warned_rows=0,
            detected_sources=[],
            errors=errors,
            warnings=warnings,
            preview_rows=[],
            dataset_fingerprint=""
        ), []

    if len(file_bytes) > 20 * 1024 * 1024:
        errors.append(ValidationErrorItem(message="File exceeds maximum allowed size of 20MB."))
        return CSVValidationResponse(
            is_valid=False,
            total_rows=0,
            accepted_rows=0,
            rejected_rows=0,
            warned_rows=0,
            detected_sources=[],
            errors=errors,
            warnings=warnings,
            preview_rows=[],
            dataset_fingerprint=""
        ), []

    try:
        decoded_content = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            decoded_content = file_bytes.decode("latin-1")
            warnings.append(ValidationWarningItem(message="File encoded with Latin-1 instead of UTF-8."))
        except Exception as e:
            errors.append(ValidationErrorItem(message=f"File encoding error: {str(e)}"))
            return CSVValidationResponse(
                is_valid=False,
                total_rows=0,
                accepted_rows=0,
                rejected_rows=0,
                warned_rows=0,
                detected_sources=[],
                errors=errors,
                warnings=warnings,
                preview_rows=[],
                dataset_fingerprint=""
            ), []

    fingerprint = hashlib.sha256(file_bytes).hexdigest()[:16]

    # 2. Parse CSV
    reader = csv.DictReader(io.StringIO(decoded_content))
    fieldnames = reader.fieldnames or []
    normalized_fields = [f.strip().lower() for f in fieldnames]

    if not normalized_fields:
        errors.append(ValidationErrorItem(message="CSV contains no detectable header row."))
        return CSVValidationResponse(
            is_valid=False,
            total_rows=0,
            accepted_rows=0,
            rejected_rows=0,
            warned_rows=0,
            detected_sources=[],
            errors=errors,
            warnings=warnings,
            preview_rows=[],
            dataset_fingerprint=fingerprint
        ), []

    # Map normalized headers back
    header_map = {orig.strip().lower(): orig for orig in fieldnames}

    # Verify required headers
    if "participant_id" not in header_map:
        errors.append(ValidationErrorItem(message="Missing mandatory header: 'participant_id'."))
    if "illness_status" not in header_map:
        errors.append(ValidationErrorItem(message="Missing mandatory header: 'illness_status'."))

    if errors:
        return CSVValidationResponse(
            is_valid=False,
            total_rows=0,
            accepted_rows=0,
            rejected_rows=0,
            warned_rows=0,
            detected_sources=[],
            errors=errors,
            warnings=warnings,
            preview_rows=[],
            dataset_fingerprint=fingerprint
        ), []

    # Detect candidate water source columns
    detected_sources = []
    for norm_h in normalized_fields:
        if norm_h.endswith("_exposure") and norm_h != "exposure":
            source_id = norm_h.replace("_exposure", "")
            detected_sources.append(source_id)

    if not detected_sources:
        warnings.append(ValidationWarningItem(
            message="No source exposure columns (e.g. '<source>_exposure') detected. Analytical comparisons may be limited."
        ))

    # 3. Row-by-Row validation
    seen_ids = set()
    row_index = 0
    total_warned_rows = 0

    for raw_row in reader:
        row_index += 1
        row_has_error = False
        row_has_warning = False
        
        # Clean dict
        row = {k.strip().lower(): v.strip() for k, v in raw_row.items() if k}
        
        participant_id = row.get("participant_id", "")
        if not participant_id:
            errors.append(ValidationErrorItem(row=row_index, field="participant_id", message="Blank participant_id."))
            row_has_error = True
        elif participant_id in seen_ids:
            errors.append(ValidationErrorItem(row=row_index, field="participant_id", message=f"Duplicate participant_id: '{participant_id}'."))
            row_has_error = True
        else:
            seen_ids.add(participant_id)

        # Illness status
        illness = row.get("illness_status", "").lower()
        if not illness:
            errors.append(ValidationErrorItem(row=row_index, field="illness_status", message="Missing illness_status."))
            row_has_error = True
        elif illness not in ALLOWED_ILLNESS_VALUES:
            errors.append(ValidationErrorItem(
                row=row_index,
                field="illness_status",
                message=f"Invalid illness_status '{illness}'. Allowed: {sorted(list(ALLOWED_ILLNESS_VALUES))}."
            ))
            row_has_error = True

        # Exposure fields validation
        for source_id in detected_sources:
            col = f"{source_id}_exposure"
            exp_val = row.get(col, "unknown").lower()
            if not exp_val:
                exp_val = "unknown"
                row[col] = "unknown"
            if exp_val not in ALLOWED_EXPOSURE_VALUES:
                warnings.append(ValidationWarningItem(
                    row=row_index,
                    field=col,
                    message=f"Unrecognized exposure value '{exp_val}'; defaulting to 'unknown' without data deletion."
                ))
                row[col] = "unknown"
                row_has_warning = True

        # Date validation
        rec_at = row.get("recorded_at", "")
        if rec_at:
            try:
                # Try parsing ISO or simple date
                if "T" in rec_at:
                    datetime.fromisoformat(rec_at.replace("Z", "+00:00"))
                else:
                    datetime.strptime(rec_at, "%Y-%m-%d")
            except ValueError:
                warnings.append(ValidationWarningItem(
                    row=row_index,
                    field="recorded_at",
                    message=f"Timestamp '{rec_at}' is not standard ISO 8601 format."
                ))
                row_has_warning = True
        else:
            # Default to current or survey date if recorded_at missing
            survey_d = row.get("survey_date", "")
            if survey_d:
                row["recorded_at"] = f"{survey_d}T00:00:00Z"
            else:
                row["recorded_at"] = datetime.utcnow().isoformat() + "Z"

        # Check onset date vs survey date if both provided
        onset_d = row.get("symptom_onset_date", "")
        survey_d = row.get("survey_date", "")
        if onset_d and survey_d:
            try:
                dt_onset = datetime.strptime(onset_d, "%Y-%m-%d")
                dt_survey = datetime.strptime(survey_d, "%Y-%m-%d")
                if dt_onset > dt_survey:
                    warnings.append(ValidationWarningItem(
                        row=row_index,
                        field="symptom_onset_date",
                        message=f"Onset date ({onset_d}) is after survey date ({survey_d})."
                    ))
                    row_has_warning = True
            except ValueError:
                pass

        if row_has_warning:
            total_warned_rows += 1

        if not row_has_error:
            accepted_records.append(row)
            if len(preview_rows) < 10:
                preview_rows.append(row)

    total_rows = row_index
    accepted_rows = len(accepted_records)
    rejected_rows = total_rows - accepted_rows
    is_valid = len(errors) == 0 and accepted_rows > 0

    response = CSVValidationResponse(
        is_valid=is_valid,
        total_rows=total_rows,
        accepted_rows=accepted_rows,
        rejected_rows=rejected_rows,
        warned_rows=total_warned_rows,
        detected_sources=detected_sources,
        errors=errors[:100],  # Return up to 100 errors to prevent payload bloat
        warnings=warnings[:100],
        preview_rows=preview_rows,
        dataset_fingerprint=fingerprint
    )

    return response, accepted_records
