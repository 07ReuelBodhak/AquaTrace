from fastapi import APIRouter, File, UploadFile
from backend.app.core.exceptions import DataParseError
from backend.app.models.schemas import DatasetMetadataResponse, DatasetUploadResponse
from backend.app.services.csv_parser import (
    parse_field_investigation_csv,
    parse_water_source_registry_csv,
)
from backend.app.services.data_store import data_store

router = APIRouter()


@router.post("/datasets/upload", response_model=DatasetUploadResponse, tags=["Datasets"])
async def upload_dataset(
    survey_file: UploadFile = File(..., description="Outbreak investigation survey CSV file"),
    sources_file: UploadFile = File(None, description="Optional candidate water source registry CSV file"),
):
    """
    Ingests and validates field investigation and candidate water source registry CSV files.
    """
    try:
        survey_bytes = await survey_file.read()
        survey_content = survey_bytes.decode("utf-8-sig")
    except Exception as exc:
        raise DataParseError(f"Could not read survey file: {str(exc)}") from exc

    records, detected_sources = parse_field_investigation_csv(survey_content)

    registry = None
    if sources_file and sources_file.filename:
        try:
            sources_bytes = await sources_file.read()
            sources_content = sources_bytes.decode("utf-8-sig")
            registry = parse_water_source_registry_csv(sources_content)
        except Exception as exc:
            raise DataParseError(f"Could not read water source registry file: {str(exc)}") from exc

    dataset_id = "current_investigation"
    data_store.set_dataset(
        dataset_id=dataset_id,
        records=records,
        source_ids=detected_sources,
        registry=registry,
    )

    metadata = data_store.get_metadata()

    return DatasetUploadResponse(
        dataset_id=dataset_id,
        row_count=len(records),
        source_ids=detected_sources,
        min_timestamp=metadata.min_timestamp,
        max_timestamp=metadata.max_timestamp,
        message="Dataset uploaded, validated, and stored successfully.",
    )


@router.get("/datasets/current", response_model=DatasetMetadataResponse, tags=["Datasets"])
async def get_current_dataset():
    """Returns metadata for the currently active outbreak investigation dataset."""
    return data_store.get_metadata()
