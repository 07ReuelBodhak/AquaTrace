# AquaTrace API & Data Contract (`api-contract.md`)

This document is the authoritative shared contract between the frontend and backend. Both agents coordinate solely through this specification.

> [!IMPORTANT]
> **Strict Contract Rule**:
> - Neither frontend nor backend agent may introduce, remove, or modify an endpoint, payload field, status code, error shape, or CSV column name without updating this document first and obtaining explicit user approval.
> - When updating endpoints or models, inform the user during the task completion report.

---

## 1. General API Conventions
- **Base URL**: `/api/v1`
- **Content Type**: `application/json` (except file uploads which use `multipart/form-data`, and PDF reports which return `application/pdf`)
- **Design System Constraint**: UI clients must use the **High-Contrast Slate** palette (exact 4 colors: `#111827`, `#374151`, `#F3F4F6`, `#FFFFFF`, strictly no 5th color).
- **Standard Error Response Format**:
```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human-readable explanation for health officers.",
    "details": []
  }
}
```

Standard Error Codes:
- `INVALID_CSV_HEADER`: Missing required columns or unexpected format.
- `DATA_PARSE_ERROR`: Malformed dates, invalid values, or empty file.
- `ZERO_DIVISION_ERROR`: Insufficient data for calculation without smoothing.
- `SOURCE_NOT_FOUND`: Referenced water source does not exist.
- `TASK_NOT_FOUND`: Response intervention task does not exist.
- `VALIDATION_ERROR`: Request payload fails schema validation.

---

## 2. Ingested Data & CSV Schema Specifications

### 2.1 Outbreak Investigation Survey CSV (`field_investigation.csv`)

| Column Header | Data Type | Required | Allowed Values / Format | Description |
| :--- | :---: | :---: | :--- | :--- |
| `participant_id` | String | Yes | Non-empty alphanumeric string (e.g. `P-001`) | Unique participant / surveyed individual identifier |
| `illness_status` | String / Integer | Yes | `"ill"`, `"well"`, `"1"`, `"0"` (normalized to boolean `is_ill`) | Case status of the participant |
| `onset_date` | String | No | ISO 8601 date (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SSZ`), null if well | Date and time symptom onset occurred |
| `recorded_at` | String | Yes | ISO 8601 timestamp (`YYYY-MM-DDTHH:MM:SSZ`) | Exact timestamp interview/log was recorded. Crucial for timeline replay |
| `age` | Integer | No | `0` to `120` | Participant age in years |
| `gender` | String | No | `"M"`, `"F"`, `"Other"`, `"Unknown"` | Demographic gender |
| `location_zone` | String | No | Alphanumeric zone or cluster identifier (e.g. `Zone-A`) | Geographic district or survey cluster |
| `<source_id>_exposure` | String / Integer | Yes (at least 1) | `1`, `0`, `"true"`, `"false"`, `"yes"`, `"no"` | Exposure status to specific candidate water source. Dynamic header matching water source IDs (e.g. `well_01_exposure`, `borewell_north_exposure`) |

### 2.2 Candidate Water Source Registry CSV (Optional Pre-load / Upload)

| Column Header | Data Type | Required | Allowed Values / Format | Description |
| :--- | :---: | :---: | :--- | :--- |
| `source_id` | String | Yes | Alphanumeric slug matching `<source_id>_exposure` column | Unique water source identifier |
| `source_name` | String | Yes | Human-readable string (e.g. `Well #4 - Sector B`) | Official or common name of the water source |
| `source_type` | String | Yes | `borewell`, `handpump`, `piped_tap`, `tanker`, `surface_well`, `other` | Infrastructure category of water point |
| `latitude` | Float | No | `-90.0` to `90.0` | Coordinate latitude |
| `longitude` | Float | No | `-180.0` to `180.0` | Coordinate longitude |
| `status` | String | Yes | `active`, `restricted`, `decommissioned`, `under_investigation` | Current operational/containment status |

---

## 3. Epidemiological Formulation Contract (Deterministic)

All epidemiological calculations are deterministic and follow established public health methods:

1. **2x2 Contingency Matrix**:
   - $a$: Number of Exposed Ill individuals
   - $b$: Number of Exposed Well individuals
   - $c$: Number of Unexposed Ill individuals
   - $d$: Number of Unexposed Well individuals
   - Exposed Total: $n_e = a + b$
   - Unexposed Total: $n_u = c + d$
   - Total Population: $N = a + b + c + d$

2. **Attack Rates**:
   - Attack Rate Exposed ($AR_e$): $\frac{a}{n_e}$
   - Attack Rate Unexposed ($AR_u$): $\frac{c}{n_u}$
   - Overall Attack Rate ($AR_{total}$): $\frac{a + c}{N}$

3. **Risk Metrics**:
   - Relative Risk ($RR$): $\frac{AR_e}{AR_u} = \frac{a / n_e}{c / n_u}$
   - Risk Difference ($RD$ / Attributable Risk): $AR_e - AR_u$
   - Population Attributable Fraction ($PAR\%$): $\frac{AR_{total} - AR_u}{AR_{total}} \times 100\%$

4. **95% Wald Log-Relative Risk Confidence Interval**:
   - Standard Error: $SE(\ln(RR)) = \sqrt{\frac{1}{a} - \frac{1}{n_e} + \frac{1}{c} - \frac{1}{n_u}}$
   - $CI_{lower} = \exp\left(\ln(RR) - 1.96 \times SE(\ln(RR))\right)$
   - $CI_{upper} = \exp\left(\ln(RR) + 1.96 \times SE(\ln(RR))\right)$
   - **Zero-Cell Handling**: If any cell ($a, b, c, d$) is 0, apply Haldane-Anscombe correction (add 0.5 to each cell for variance and RR estimation) and set `zero_cell_corrected: true`.

5. **Priority Status Categorisation**:
   - `HIGH_PRIORITY`: $RR \ge 2.0$ AND $CI_{lower} > 1.0$ AND $a \ge 5$ (Statistically significant elevated risk)
   - `MODERATE_PRIORITY`: ($RR > 1.2$ OR ($RR \ge 2.0$ AND $CI_{lower} \le 1.0$)) AND $a \ge 3$
   - `LOW_PRIORITY`: $RR \le 1.0$ OR $CI_{upper} < 1.0$
   - `INSUFFICIENT_DATA`: Exposed cases $a < 3$ or exposed total $n_e < 5$

6. **Timeline Replay Invariant**:
   - Given cutoff timestamp $T$, the dataset is strictly filtered to records where `recorded_at <= T`.
   - Records with `recorded_at > T` are completely excluded. Zero future data leakage.

---

## 4. Endpoints Registry

### Summary Table

| Method | Endpoint | Description | Request Type | Response Type | Status Codes |
| :---: | :--- | :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/health` | Service health status | None | `HealthResponse` | 200 |
| `POST` | `/api/v1/auth/login` | Health officer authentication / mock credentials | `LoginRequest` | `AuthSessionResponse` | 200, 401 |
| `GET` | `/api/v1/auth/session` | Inspect active officer session status | None | `AuthSessionResponse` | 200, 401 |
| `POST` | `/api/v1/datasets/upload` | Upload survey and source CSVs | `multipart/form-data` | `DatasetUploadResponse` | 200, 400, 422 |
| `GET` | `/api/v1/datasets/current` | Active dataset summary & detected sources | None | `DatasetMetadataResponse` | 200, 404 |
| `GET` | `/api/v1/datasets/sources` | Evaluated candidate water sources with 2x2 counts, attack rates, relative risk, Wald 95% CI, and priority status (supports `sort_by`, `order`, `priority_filter`, `timeline_cutoff`) | Query params | `List[SourceComparison]` | 200, 404 |
| `GET` | `/api/v1/analysis/timeline-range` | Outbreak temporal bounds & epicurve buckets | Query params (`step_hours`) | `TimelineRangeResponse` | 200, 404 |
| `POST` | `/api/v1/analysis/calculate` | Compute 2x2 contingency tables & RR for timestamp $T$ | `AnalysisRequest` | `AnalysisResponse` | 200, 400, 422 |
| `POST` | `/api/v1/reports/pdf` | Generate Field Investigation Brief PDF | `ReportRequest` | `application/pdf` | 200, 400, 500 |
| `POST` | `/api/v1/reports/narrative-summary` | Guardrailed AI brief summary | `NarrativeSummaryRequest` | `NarrativeSummaryResponse` | 200, 400, 500 |
| `GET` | `/api/v1/response-tasks` | List all response intervention tasks | Query params (`source_id`, `status`) | `TaskListResponse` | 200 |
| `POST` | `/api/v1/response-tasks` | Create new response containment task | `CreateTaskRequest` | `TaskResponse` | 201, 400 |
| `PATCH` | `/api/v1/response-tasks/{task_id}` | Update response task status or details | `UpdateTaskRequest` | `TaskResponse` | 200, 404, 400 |
| `DELETE` | `/api/v1/response-tasks/{task_id}` | Delete response task | None | `TaskDeleteResponse` | 200, 404 |

---

## 5. Change History

| Version | Date | Author / Agent | Changes Made | User Approved (Y/N) |
| :---: | :---: | :---: | :--- | :---: |
| 0.1 | 2026-10-28 | Orchestrator | Initial structured template created | Approved |
| 1.0 | 2026-10-28 | Planner | Completed comprehensive API contract: CSV schemas, 2x2 contingency formulas, Wald 95% CI, timeline replay invariant, PDF brief, LangChain/Groq summary guardrails, response task management | Pending User Review |
