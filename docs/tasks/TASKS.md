# AquaTrace Task Execution Plan (`TASKS.md`)

This document is the definitive progress tracker for AquaTrace development. Tasks are executed strictly **one at a time**. 
Status values:
- `Not Started`
- `In Progress`
- `Awaiting My Review`
- `Done`

---

## Current Task Status

- **Active Task**: None (TASK-02 Complete, Awaiting Review)
- **Overall Progress**: 50% (TASK-02 Awaiting Review)

---

## Ordered Task List

| Task ID | Task Title | Primary Owner | Target Directory | Status | Dependencies | Description Summary |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **TASK-00** | Multi-Agent Environment & Docs Setup | Orchestrator | `.agents/`, `docs/` | `Done` | None | Initialized agent roles, skills, workflows, project rules, and empty structured docs. |
| **TASK-01** | Backend Environment, Epidemiological Engine & Project Foundation | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Done` | TASK-00 | Set up `/backend/.venv`, requirements, FastAPI core, deterministic 2x2 contingency matrix engine with Wald 95% CI, CSV ingestion parser, Next.js frontend scaffold with High-Contrast Slate design system. |
| **TASK-LANDING** | Design and Implement Premium AquaTrace Landing Page | Frontend Dev | `/frontend` | `Done` | TASK-01 | Design & implement beautiful, responsive, 4-color High-Contrast Slate landing page with 9 required sections and preserved investigation workspace. |
| **TASK-02** | Health Officer Outbreak Dashboard & Candidate Source Prioritisation UI | Frontend Dev / Backend Dev / Docs-Keeper | `/frontend`, `/backend`, `/docs` | `Awaiting My Review` | TASK-01 | Build Stitch MCP-driven public health officer dashboard, candidate water source prioritisation table with risk badges, and interactive 2x2 contingency matrix inspection drawer. |
| **TASK-03** | Temporal Timeline Replay & Zero-Leakage Scrubbing Engine | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Not Started` | TASK-02 | Implement strict temporal slicing (`recorded_at <= T`), timeline playback controller, interactive timeline scrubber, and dynamic epicurve case visualization. |
| **TASK-04** | Response Planner & Containment Task Management | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Not Started` | TASK-03 | Implement response intervention task tracking (boil-water advisories, source isolation, water sampling), task status lifecycle, and Stitch MCP response planner screen. |
| **TASK-05** | Field Investigation Brief PDF Report & Guardrailed Narrative Summary | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Not Started` | TASK-04 | Generate publication-grade monochrome Field Investigation Brief PDF via ReportLab, and implement LangChain/Groq narrative briefing with strict data guardrails (and deterministic fallback). |
| **TASK-06** | End-to-End Polish, Validation Audit & Manual Verification Handover | Frontend Dev / Backend Dev / Docs-Keeper | `/frontend`, `/backend`, `/docs` | `Not Started` | TASK-05 | Conduct comprehensive UI slate constraint audit (no 5th color, no emojis), verify standard error schemas across all endpoints, validate edge cases, and finalize documentation. |

---

## Detailed Task Specifications

### [TASK-01] Backend Environment, Epidemiological Engine & Project Foundation
- **Status**: `Not Started`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-00 approved; `/docs/api-contract.md` approved.
- **Backend Scope (`/backend`)**:
  - Configure Python virtual environment strictly at `/backend/.venv`.
  - Maintain `/backend/requirements.txt` (`fastapi`, `uvicorn`, `pydantic`, `python-multipart`, `pymongo`, `motor`).
  - Implement FastAPI application entrypoint with `/api/v1` router and standard error handlers.
  - Implement deterministic epidemiological calculation service:
    - 2x2 contingency table generation ($a, b, c, d$).
    - Attack rates ($AR_e, AR_u, AR_{total}$).
    - Relative Risk ($RR$) and Risk Difference ($RD$).
    - 95% Wald log-RR confidence intervals ($CI_{lower}, CI_{upper}$).
    - Haldane-Anscombe zero-cell correction.
    - Candidate source priority classification (`HIGH_PRIORITY`, `MODERATE_PRIORITY`, `LOW_PRIORITY`, `INSUFFICIENT_DATA`).
  - Implement CSV parser for participant investigation survey files and water source registry files.
  - Implement endpoints: `GET /api/v1/health`, `POST /api/v1/datasets/upload`, `POST /api/v1/analysis/calculate`.
  - Zero automated tests.
- **Frontend Scope (`/frontend`)**:
  - Configure Next.js App Router project in `/frontend` with TypeScript and Tailwind CSS.
  - Configure Tailwind with exact High-Contrast Slate palette:
    - Slate 900: `#111827`
    - Slate 700: `#374151`
    - Slate 100: `#F3F4F6`
    - White: `#FFFFFF`
    - Verify NO 5th color is configured or used.
  - Setup base layout, navigation bar (no emojis, professional clinical typography), and type-safe API client wrapper.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/backend.md` and `docs/file-index/frontend.md` with all newly created files.
  - Record task execution in `TASKS.md` change log.
- **Acceptance Criteria (User Manual Testing)**:
  - User can activate `/backend/.venv` and start FastAPI backend.
  - `GET /api/v1/health` returns healthy status.
  - Uploading a sample CSV yields exact mathematical outputs matching manual hand calculation of $RR$ and 95% Wald CI.
  - Frontend builds with Next.js and displays High-Contrast Slate typography and color scheme.

---

### [TASK-02] Health Officer Outbreak Dashboard & Candidate Source Prioritisation UI
- **Status**: `Not Started`
- **Assigned Agents**: `frontend-developer`, `backend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-01 completed and approved.
- **Backend Scope (`/backend`)**:
  - Implement `GET /api/v1/datasets/current` and `GET /api/v1/datasets/sources`.
  - Add source filtering and sorting capabilities (by $RR$, by Attack Rate, by Priority Status).
- **Frontend Scope (`/frontend`)**:
  - Use Stitch MCP to generate health officer dashboard layouts adhering strictly to High-Contrast Slate palette.
  - Build Outbreak Overview KPI header cards (Total Surveyed, Total Cases, Overall Attack Rate, Active Candidate Sources).
  - Build Candidate Water Source Prioritisation table displaying Source Name, Type, Exposed Attack Rate, Unexposed Attack Rate, Relative Risk, 95% CI range, and high-contrast priority badge.
  - Build interactive 2x2 Contingency Matrix drawer/modal revealing exact cell breakdown ($a, b, c, d$), marginal totals, and zero-cell indicator.
  - Build CSV file upload component with drag-and-drop and validation error banners.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/frontend.md` and `docs/file-index/backend.md`.
  - Log completed files and Stitch screen IDs.
- **Acceptance Criteria (User Manual Testing)**:
  - User loads sample dataset via UI; summary cards populate immediately.
  - Candidate sources are correctly sorted by Relative Risk with appropriate high-contrast badges.
  - Clicking a candidate water source opens the 2x2 matrix drawer with exact numbers clearly displayed.

---

### [TASK-03] Temporal Timeline Replay & Zero-Leakage Scrubbing Engine
- **Status**: `Not Started`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-02 completed and approved.
- **Backend Scope (`/backend`)**:
  - Implement temporal slicing logic in analysis engine: filter records where `recorded_at <= T`.
  - Ensure zero future data leakage: records with `recorded_at > T` are completely excluded from counts, attack rates, and risk scores.
  - Implement `GET /api/v1/analysis/timeline-range` returning min/max timestamps and temporal distribution buckets.
- **Frontend Scope (`/frontend`)**:
  - Build timeline replay controller component via Stitch MCP:
    - Play / Pause / Step forward / Step backward buttons.
    - Continuous time scrubber slider with timestamp callout.
    - Speed selector (1x, 2x, 5x).
  - Build outbreak epicurve visualization (cases over time) aligned with the slider.
  - Wire timeline state so scrubbing slider dynamically triggers analysis calculation at cutoff $T$ and updates the entire dashboard in real time.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/` and `TASKS.md` change log.
- **Acceptance Criteria (User Manual Testing)**:
  - User can scrub backward in time and observe candidate source attack rates and rankings reflect only data known at that earlier point in time.
  - At early timestamps, sources with few cases correctly show `INSUFFICIENT_DATA`.
  - Verified no future data leakage at any timestamp $T$.

---

### [TASK-04] Response Planner & Containment Task Management
- **Status**: `Not Started`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-03 completed and approved.
- **Backend Scope (`/backend`)**:
  - Implement Response Planner service and data model:
    - Task entity: `task_id`, `source_id`, `action_type` (boil-water notice, shutoff, water testing, alternate supply, sanitation), `title`, `priority`, `status` (`PLANNED`, `IN_PROGRESS`, `COMPLETED`), `assigned_team`, `due_date`, `notes`.
  - Implement CRUD endpoints:
    - `GET /api/v1/response-tasks`
    - `POST /api/v1/response-tasks`
    - `PATCH /api/v1/response-tasks/{task_id}`
    - `DELETE /api/v1/response-tasks/{task_id}`
- **Frontend Scope (`/frontend`)**:
  - Use Stitch MCP to build Response Planner workspace screen:
    - Action item list / card view grouped by status or candidate source.
    - "Add Containment Action" modal linking directly to flagged water sources.
    - Status toggle buttons (e.g. mark `IN_PROGRESS` or `COMPLETED`).
    - Direct "Create Intervention" shortcut button from the high-risk candidate sources table.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/frontend.md` and `docs/file-index/backend.md`.
  - Update `TASKS.md` change log.
- **Acceptance Criteria (User Manual Testing)**:
  - User can create containment tasks for high-priority water sources.
  - User can transition tasks through the lifecycle and verify status updates persist across page reloads.

---

### [TASK-05] Field Investigation Brief PDF Report & Guardrailed Narrative Summary
- **Status**: `Not Started`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-04 completed and approved.
- **Backend Scope (`/backend`)**:
  - Install `reportlab` inside `/backend/.venv` and add to `requirements.txt`.
  - Build deterministic PDF report generator formatted as an official Field Investigation Brief:
    - Outbreak summary headers, officer metadata, epicurve summary.
    - Candidate water sources prioritisation table.
    - Formatted 2x2 contingency tables and 95% Wald CI data.
    - Response containment task status log.
    - Strict monochrome / slate styling matching health department publications.
  - Implement LangChain / Groq narrative summary service:
    - Prompt guardrail: Inject pre-calculated deterministic statistics into system prompt; instruct LLM never to alter or recalculate numbers.
    - Fallback mechanism: If `GROQ_API_KEY` is absent, automatically return deterministic template summary with zero errors.
  - Endpoints: `POST /api/v1/reports/pdf`, `POST /api/v1/reports/narrative-summary`.
- **Frontend Scope (`/frontend`)**:
  - Build Export / Reporting modal via Stitch MCP:
    - Download Field Investigation Brief PDF button.
    - Executive Narrative Briefing toggle and markdown display card.
    - Metadata inputs (investigating officer name, title).
- **Docs-Keeper Scope**:
  - Update `docs/file-index/` and `TASKS.md` change log.
- **Acceptance Criteria (User Manual Testing)**:
  - User can generate and download a clean, multi-page PDF brief that opens correctly in PDF viewers.
  - Narrative brief displays factual outbreak context and matches exact numbers from the deterministic engine.

---

### [TASK-06] End-to-End Polish, Validation Audit & Manual Verification Handover
- **Status**: `Not Started`
- **Assigned Agents**: `frontend-developer`, `backend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-05 completed and approved.
- **Backend Scope (`/backend`)**:
  - Audit all endpoints for standard error shapes (`400`, `404`, `422`, `500`).
  - Validate edge-case CSV inputs (all unexposed ill = 0, single source datasets, extreme date ranges).
  - Verify zero test files or test dependencies exist in `/backend`.
- **Frontend Scope (`/frontend`)**:
  - Audit entire UI against the 4-color High-Contrast Slate constraint (`#111827`, `#374151`, `#F3F4F6`, `#FFFFFF`) with zero 5th color.
  - Verify zero emojis across all pages and components.
  - Verify zero test files or test scripts in `/frontend`.
  - Ensure responsive layout for desktop and field tablets.
- **Docs-Keeper Scope**:
  - Final synchronization of `/docs/api-contract.md`, `/docs/tasks/TASKS.md`, `/docs/file-index/frontend.md`, and `/docs/file-index/backend.md`.
  - Create sample CSV datasets in `/docs/samples/` for user manual verification.
- **Acceptance Criteria (User Manual Testing)**:
  - User successfully completes full manual workflow: CSV upload -> Outbreak overview -> 2x2 table inspection -> Timeline scrubber replay -> Response task assignment -> PDF report export.

---

## Task Change Log

| Date & Time | Task ID | Changed Files | Features Implemented / Updates | Status Transition |
| :--- | :---: | :--- | :--- | :--- |
| 2026-10-28 | TASK-00 | `.agents/*`, `docs/*`, `AGENTS.md` | Initialized agent framework, rules, workflows, skills, and doc structures | `Done` |
| 2026-10-28 | Planning | `/docs/api-contract.md`, `/docs/tasks/TASKS.md` | Author complete API contract and decompose requirements into TASK-01 through TASK-06 | `Done` |
| 2026-10-28 | TASK-LANDING | `/frontend/src/app/page.tsx`, `/frontend/src/app/investigation/*`, `/frontend/src/app/globals.css`, `/frontend/tailwind.config.ts` | Implemented 9-section High-Contrast Slate landing page with 4 base colors, synthetic evidence matrix preview, mobile navigation, and preserved investigation workstation | `Awaiting My Review` |
| 2026-10-28 | TASK-01 | `/backend/app/*`, `/frontend/src/*`, `/docs/*` | Backend epidemiological engine, CSV parser, state store, Next.js High-Contrast Slate layout, and API client wrapper | `In Progress` -> `Done` |
| 2026-10-28 | TASK-02 | `/frontend/src/app/investigation/page.tsx`, `/backend/app/routes/api.py`, `/backend/app/schemas/models.py`, `/backend/app/services/statistical_engine.py` | Added outbreak KPI cards, CSV dropzone & demo loader, candidate water source prioritisation table with sorting/filtering, 2x2 contingency matrix drawer, and backend endpoints `GET /api/v1/datasets/current` & `GET /api/v1/datasets/sources` | `In Progress` -> `Awaiting My Review` |
