# Backend File Index (`/backend`)

This document tracks all files inside the `/backend` directory. Agents must consult this index before modifying or adding files, rather than scanning the entire directory. Whenever a backend file is created, moved, renamed, or modified, its entry in this table must be updated immediately in the same task.

---

## File Registry

| File Path | Purpose / Responsibility | Imports / Upstream Modules | Connected Routes / Downstream Dependents | External Libraries (in `.venv`) |
| :--- | :--- | :--- | :--- | :--- |
| `backend/app/core/config.py` | App configuration and environment settings | `pydantic_settings` | `backend/app/main.py` | `pydantic-settings` |
| `backend/app/core/exceptions.py` | Custom domain exceptions and standard error formats | None | `backend/app/main.py`, services, endpoints | Standard library |
| `backend/app/models/schemas.py` | Pydantic request/response models conforming to `/docs/api-contract.md` | `pydantic` | All endpoints and services | `pydantic` |
| `backend/app/services/epi_engine.py` | Deterministic 2x2 contingency matrix, attack rates, Wald 95% CI, Haldane-Anscombe correction, and priority classification | `math`, `typing`, `backend.app.models.schemas` | `backend/app/services/data_store.py`, `backend/app/api/v1/endpoints/analysis.py` | None |
| `backend/app/services/csv_parser.py` | Ingests and validates field investigation and candidate water source registry CSVs | `csv`, `io`, `datetime`, `backend.app.core.exceptions`, `backend.app.models.schemas` | `backend/app/api/v1/endpoints/datasets.py` | None |
| `backend/app/services/data_store.py` | In-memory thread-safe state store for active dataset with zero-leakage timeline cutoff filtering (`recorded_at <= T`) | `datetime`, `typing`, `backend.app.models.schemas`, `backend.app.services.epi_engine` | `backend/app/api/v1/endpoints/datasets.py`, `backend/app/api/v1/endpoints/analysis.py` | None |
| `backend/app/api/v1/endpoints/health.py` | Health check endpoint (`GET /api/v1/health`) | `fastapi`, `backend.app.models.schemas` | `backend/app/api/v1/router.py` | `fastapi` |
| `backend/app/api/v1/endpoints/datasets.py` | CSV dataset upload and current dataset metadata endpoints (`POST /datasets/upload`, `GET /datasets/current`) | `fastapi`, `backend.app.services.csv_parser`, `backend.app.services.data_store` | `backend/app/api/v1/router.py` | `fastapi`, `python-multipart` |
| `backend/app/api/v1/endpoints/analysis.py` | Epidemiological calculation at cutoff timestamp $T$ and timeline range endpoints (`POST /analysis/calculate`, `GET /analysis/timeline-range`) | `fastapi`, `backend.app.models.schemas`, `backend.app.services.data_store` | `backend/app/api/v1/router.py` | `fastapi` |
| `backend/app/api/v1/router.py` | Central `/api/v1` APIRouter aggregating all endpoint subrouters | `fastapi`, endpoints | `backend/app/main.py` | `fastapi` |
| `backend/app/routes/api.py` | FastAPI route handlers for investigations, CSV upload/validation, statistical analysis, `GET /datasets/current`, `GET /datasets/sources`, timeline analysis, PDF reports, AI explanations, and tasks | `fastapi`, `backend.app.schemas.models`, `backend.app.storage`, `backend.app.services.*` | `backend/app/main.py` | `fastapi`, `python-multipart` |
| `backend/app/schemas/models.py` | Pydantic data models for investigations, CSV validation, contingency tables, risk metrics, candidate source comparisons, tasks, and current dataset | `pydantic` | `backend/app/routes/api.py`, `backend/app/services/*` | `pydantic` |
| `backend/app/services/statistical_engine.py` | Deterministic epidemiological calculations: 2x2 contingency matrix, attack rates, relative risk, risk difference, Wald 95% log-RR CI, Haldane-Anscombe correction, priority ranking | `math`, `typing`, `backend.app.schemas.models` | `backend/app/routes/api.py`, `backend/app/services/timeline_engine.py` | None |
| `backend/app/services/timeline_engine.py` | Temporal slicing (`recorded_at <= T`), epicurve aggregation, and time-bound epidemiological analysis without future-data leakage | `datetime`, `backend.app.schemas.models`, `backend.app.services.statistical_engine` | `backend/app/routes/api.py` | None |
| `backend/app/services/csv_validator.py` | Ingests, inspects, and validates outbreak survey CSV records and candidate water sources | `csv`, `io`, `datetime`, `backend.app.schemas.models` | `backend/app/routes/api.py` | None |
| `backend/app/storage.py` | Asynchronous in-memory / MongoDB storage repository for investigations, dataset versions, and response tasks | `motor`, `backend.app.database`, `backend.app.schemas.models` | `backend/app/routes/api.py` | `motor`, `pymongo` |
| `backend/app/main.py` | FastAPI application initialization, CORS middleware, lifespan events, and standard JSON error handlers | `fastapi`, `fastapi.middleware.cors`, `backend.app.core.config`, `backend.app.api.v1.router` | Server entrypoint | `fastapi`, `uvicorn` |

---

## Index Maintenance Rules for Agents

1. **Check First**: Read this table before proposing or editing backend code to identify module boundaries, models, and service dependencies.
2. **Update Synchronously**: When creating, renaming, refactoring, or deleting any file in `/backend`, update this table during the same task.
3. **Environment Compliance**: Ensure any imported third-party library is present in `/backend/requirements.txt` and installed in `/backend/.venv`.
4. **Contract Synchronization**: If any file changes an API endpoint or request/response model, verify that `/docs/api-contract.md` has been updated and approved.
