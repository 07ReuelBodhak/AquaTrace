# AquaTrace Task Execution Plan (`TASKS.md`)

This document is the definitive progress tracker for AquaTrace development. Tasks are executed strictly **one at a time**. 
Status values:
- `Not Started`
- `In Progress`
- `Awaiting My Review`
- `Done`

---

## Current Task Status

- **Active Task**: None (All Tasks Complete — 100%)
- **Overall Progress**: 100%

---

## Ordered Task List

| Task ID | Task Title | Primary Owner | Target Directory | Status | Dependencies | Description Summary |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **TASK-00** | Multi-Agent Environment & Docs Setup | Orchestrator | `.agents/`, `docs/` | `Done` | None | Initialized agent roles, skills, workflows, project rules, and empty structured docs. |
| **TASK-01** | Backend Environment, Epidemiological Engine & Project Foundation | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Done` | TASK-00 | Set up `/backend/.venv`, requirements, FastAPI core, deterministic 2x2 contingency matrix engine with Wald 95% CI, CSV ingestion parser, Next.js frontend scaffold with High-Contrast Slate design system. |
| **TASK-LANDING** | Design and Implement Premium AquaTrace Landing Page | Frontend Dev | `/frontend` | `Done` | TASK-01 | Design & implement beautiful, responsive, 4-color High-Contrast Slate landing page with 9 required sections and preserved investigation workspace. |
| **TASK-02** | Health Officer Outbreak Dashboard & Candidate Source Prioritisation UI | Frontend Dev / Backend Dev / Docs-Keeper | `/frontend`, `/backend`, `/docs` | `Done` | TASK-01 | Build public health officer dashboard, candidate water source prioritisation table with risk badges, interactive 2x2 contingency matrix drawer, CSV upload dropzone, and synthetic demo loader. |
| **TASK-03** | Officer Authentication & Temporal Timeline Replay Engine | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Done` | TASK-02 | Implement health officer login screen (`/login`) with session management, temporal slicing (`recorded_at <= T`), timeline playback controller, lazy-loaded dynamic epicurve case chart, and version-keyed cache. |
| **TASK-04** | Field Investigation Brief PDF Report & Guardrailed Narrative Summary | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Done` | TASK-03 | Implement server-side monochrome ReportLab PDF export matching exact analysis snapshot, and Groq narrative briefing (`openai/gpt-oss-120b`) with strict data guardrails and deterministic fallback. |
| **TASK-05** | Human-Controlled Response Planner & Candidate Source Map | Backend Dev / Frontend Dev / Docs-Keeper | `/backend`, `/frontend`, `/docs` | `Done` | TASK-04 | Implement human-controlled intervention checklist/task tracking (zero autonomous dispatch), and lazy-loaded candidate water source coordinate map (renders only validated coordinates; table fallback). |
| **TASK-06** | MongoDB Verification, Performance Benchmarks & End-to-End Audit | Frontend Dev / Backend Dev / Docs-Keeper | `/frontend`, `/backend`, `/docs` | `Done` | TASK-05 | Verify MongoDB persistence of investigations and dataset versions, validate full CSV import -> source analysis -> timeline replay -> PDF workflow, audit 4-color slate palette, and benchmark against SRS targets. |

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

### [TASK-03] Officer Authentication & Temporal Timeline Replay Engine
- **Status**: `Awaiting My Review`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-02 completed and approved.
- **Backend Scope (`/backend`)**:
  - Implement authentication session / login check (`POST /api/v1/auth/login`, `GET /api/v1/auth/session`) supporting health officer credential verification.
  - Implement temporal slicing logic in analysis engine: filter records where `recorded_at <= T` strictly normalized in UTC.
  - Invariant: Zero future-data leakage (`recorded_at > T` records strictly excluded from 2x2 counts, attack rates, and risk scores).
  - Version-keyed analysis cache: cache key must combine `investigation_id`, `dataset_version_id`, `calculation_method_version`, `timeline_cutoff`, and `parameters`.
  - Invalidation: automatic cache invalidation on new dataset upload or version commit.
  - Implement `GET /api/v1/analysis/timeline-range` returning min/max UTC timestamps and temporal epicurve distribution buckets.
- **Frontend Scope (`/frontend`)**:
  - Build Officer Login page (`/frontend/src/app/login/page.tsx`):
    - Strict 4-color High-Contrast Slate palette, zero rounded corners (`rounded-none`), zero emojis.
    - Badged credentials, login action, session storage, and route protection.
  - Build Timeline Replay Controller in `/investigation`:
    - Play / Pause / Step forward / Step backward controls.
    - Continuous time scrubber slider with timestamp callout and speed selector (1x, 2x, 5x).
  - Build lazy-loaded Outbreak Epicurve visualization component with loading fallback:
    - Displays case counts over time aligned with the slider cutoff $T$.
    - Table/text alternative for accessibility (WCAG 2.2 AA).
  - Connect scrubber state to dynamically recompute source attack rates, relative risk, and priority badges at cutoff $T$.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/frontend.md` and `docs/file-index/backend.md`.
  - Update `TASKS.md` and `api-contract.md`.
- **Acceptance Criteria (User Manual Testing)**:
  - Health officer can log in at `/login` and access the workstation.
  - User can scrub backward in time and observe candidate source attack rates and rankings reflect only data known at cutoff $T$.
  - At early timestamps, sources with few cases correctly show `INSUFFICIENT_DATA_TO_COMPARE`.
  - Future-data leakage test: records with `recorded_at > T` do not affect replay results.

---

### [TASK-04] Field Investigation Brief PDF Report & Guardrailed Narrative Summary
- **Status**: `Not Started`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-03 completed and approved.
- **Backend Scope (`/backend`)**:
  - Ensure `reportlab` inside `/backend/.venv` and `requirements.txt`.
  - Build deterministic server-side PDF generator formatted as an official Field Investigation Brief:
    - Outbreak summary headers, officer metadata, selected dataset version/hash, timeline cutoff $T$, analysis method version.
    - Candidate water sources prioritisation table with display order, 2x2 cells, group denominators, attack rates, RR, and 95% Katz log-Wald CI.
    - Data quality accounting: received, accepted, rejected, unknown illness/exposure counts.
    - Non-diagnostic disclaimer: "An observed statistical association does not establish that a source is contaminated or prove causation."
    - Strict monochrome / slate styling matching health department publications.
  - Implement LangChain / Groq narrative briefing service:
    - Guardrail: pass only allowlisted aggregate statistics and reviewed field notes; never send raw participant rows.
    - Model output validated against schema; deterministic template fallback when `GROQ_API_KEY` is not provided or provider fails.
  - Endpoints: `POST /api/v1/reports/pdf`, `POST /api/v1/reports/narrative-summary`.
- **Frontend Scope (`/frontend`)**:
  - Lazy-load report preview modal with accessible loading and error fallback.
  - Download Field Investigation Brief PDF button triggering streaming download.
  - Executive narrative briefing card with draft disclaimer and officer credentials.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/` and `TASKS.md` change log.
- **Acceptance Criteria (User Manual Testing)**:
  - User can generate and download a multi-page PDF brief that opens cleanly in PDF viewers.
  - PDF metrics match exact numbers from the deterministic engine snapshot.

---

### [TASK-05] Human-Controlled Response Planner & Candidate Source Map
- **Status**: `Not Started`
- **Assigned Agents**: `backend-developer`, `frontend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-04 completed and approved.
- **Backend Scope (`/backend`)**:
  - Responsible Response Planner: human-controlled task tracking (boil-water notices, source isolation, water sampling). The system tracks proposed actions but never autonomously dispatches teams or issues advisories.
  - Endpoints: `GET /api/v1/tasks/{inv_id}`, `POST /api/v1/tasks/{inv_id}`, `PATCH /api/v1/tasks/{inv_id}/{task_id}`.
  - Validated source location endpoint: returns latitude/longitude only when coordinates are explicitly validated and present.
- **Frontend Scope (`/frontend`)**:
  - Response Planner drawer / tab in `/investigation`:
    - Checklist of containment actions linked to high-priority candidate water sources.
    - Manual status toggles (`PLANNED`, `IN_PROGRESS`, `COMPLETED`).
  - Lazy-loaded Candidate Water Source Map component:
    - Renders markers only for candidate water sources with valid coordinates.
    - Never infers locations or computes proximity exposures.
    - Accessible table fallback when coordinates are absent or map fails to load.
- **Docs-Keeper Scope**:
  - Update `docs/file-index/` and `TASKS.md` change log.
- **Acceptance Criteria (User Manual Testing)**:
  - User can create and update response intervention tasks manually.
  - Candidate source map renders existing coordinate points and gracefully falls back to tabular display when coordinates are absent.

---

### [TASK-06] MongoDB Verification, Performance Benchmarks & End-to-End Audit
- **Status**: `Not Started`
- **Assigned Agents**: `frontend-developer`, `backend-developer`, `docs-keeper`
- **Pre-conditions**: TASK-05 completed and approved.
- **Scope**:
  - **MongoDB Persistence Verification**: Verify that investigations, dataset versions, and participant records persist correctly in MongoDB when configured, with clean fallback to in-memory store.
  - **Cache Validation**: Test cache keys across dataset versions, cutoff timestamps, and calculation parameters; verify cache invalidation on new import.
  - **Statistical Validation**: Test Katz log-Wald 95% CI and Haldane-Anscombe zero-cell correction against SRS Section 16.5 synthetic fixtures (Handpump 14: RR=4.0; Well 3: RR=1.0; Community Tank 2: RR=1.0).
  - **End-to-End Workflow Verification**: Test full CSV import -> validation -> source analysis -> timeline replay -> PDF export pipeline.
  - **Design & Security Audit**: Audit 4-color High-Contrast Slate palette, zero emojis, zero rounded corners, safe error envelopes, and input bounds.
- **Acceptance Criteria (User Manual Testing)**:
  - User verifies full end-to-end outbreak investigation workflow successfully.
  - All audit checks documented and confirmed.
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
| 2026-10-28 | TASK-02 | `/frontend/src/app/investigation/page.tsx`, `/backend/app/routes/api.py`, `/backend/app/schemas/models.py`, `/backend/app/services/statistical_engine.py` | Added outbreak KPI cards, CSV dropzone & demo loader, candidate water source prioritisation table with sorting/filtering, 2x2 contingency matrix drawer, and backend endpoints `GET /api/v1/datasets/current` & `GET /api/v1/datasets/sources` | `Done` |
| 2026-10-28 | TASK-03 | `/frontend/src/app/login/page.tsx`, `/frontend/src/app/investigation/components/*`, `/backend/app/routes/api.py`, `/backend/app/services/timeline_engine.py` | Implemented Officer Login gateway, temporal slicing (`recorded_at <= T`), timeline playback controller, lazy-loaded epicurve chart, and version-keyed cache | `Done` |
| 2026-10-28 | TASK-04 | `/backend/app/services/report_generator.py`, `/backend/app/services/ai_explainer.py`, `/frontend/src/app/investigation/page.tsx`, `/frontend/src/lib/api.ts` | Implemented ReportLab publication-grade Field Brief PDF export, and Groq `openai/gpt-oss-120b` guardrailed executive narrative synthesis with deterministic fallback | `Awaiting My Review` |
