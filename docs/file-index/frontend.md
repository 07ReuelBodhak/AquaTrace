# Frontend File Index (`/frontend`)

This document tracks all files inside the `/frontend` directory. Agents must consult this index before modifying or adding files, rather than scanning the entire directory. Whenever a frontend file is created, moved, renamed, or modified, its entry in this table must be updated immediately in the same task.

---

## File Registry

| File Path | Purpose / Responsibility | Imports / Upstream Dependencies | Exported Components / Downstream Usage | Stitch Screen / Source Reference |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/tailwind.config.ts` | Configures Water & Public Health design system: Navy (`#123B5D`), Teal (`#0F766E`), Pale Aqua (`#DDF4F1`), Cool Off-white (`#F6FAFC`), Surface (`#FFFFFF`), rounded borders, and refined box shadows | `tailwindcss` | Tailwind utility classes | Water & Public Health Palette |
| `frontend/src/app/globals.css` | Water & Public Health CSS variables, typography roles (Heading and Body), accessible focus rings, reduced-motion queries, and custom scrollbar | Tailwind directives | Global styling | Water & Public Health Palette |
| `frontend/src/lib/api.ts` | Type-safe API client wrapper for `/api/v1` endpoints (Health, Dataset upload, Analysis, Current dataset metadata, Sources, Timeline range) | `fetch`, TypeScript interfaces | `api`, `HealthResponse`, `DatasetUploadResponse`, `AnalysisResponse`, `ApiClientError` | `/docs/api-contract.md` |
| `frontend/src/app/layout.tsx` | Clean root layout: Geist fonts, metadata, and smooth scrolling | `next/font/local`, `globals.css` | `RootLayout` | Root Application Shell |
| `frontend/src/app/page.tsx` | Redesigned AquaTrace Landing Page: Water & Public Health palette, plain-language 10-section narrative, interactive exposed vs unexposed evidence switcher, problem explanation, 4-step workflow, and responsive layout | `react`, `next/link` | `AquaTraceLandingPage` | Public Health Landing Page |
| `frontend/src/app/login/page.tsx` | Health Officer Access Control Gateway: badge authorization, jurisdiction setting, 1-click test credential fill, and audit confidentiality notice | `react`, `next/link`, `next/navigation` | `OfficerLoginPage` | Officer Access Gateway |
| `frontend/src/app/investigation/layout.tsx` | Workstation shell: top navigation, institutional telemetry, active officer session indicator with link to `/login` | `react`, `next/link` | `InvestigationLayout` | Outbreak Workstation Shell |
| `frontend/src/app/investigation/page.tsx` | Redesigned Outbreak Dashboard: 4 clinical KPI cards, CSV dropzone with 1-click canonical outbreak loader, candidate water source prioritisation table with plain-language labels, side 2x2 contingency matrix drawer, and timeline scrubbing integration | `react`, `src/lib/api.ts`, components | `InvestigationDashboard` | Outbreak Workstation Dashboard |
| `frontend/src/app/investigation/components/EpicurveChart.tsx` | Lazy-loaded epidemic curve visualization module with WCAG 2.2 AA accessible table view toggle, daily case bars, and active replay cutoff indicator | `react` | `EpicurveChart` | Epidemic Curve Visualizer |
| `frontend/src/app/investigation/components/TimelineReplayController.tsx` | Interactive timeline playback engine: play/pause timer, speed multiplier (1x, 2x, 5x), step buttons, slider scrubber, and zero-leakage cohort accounting | `react`, `next/dynamic`, `EpicurveChart` | `TimelineReplayController` | Temporal Replay Controller |
| `frontend/src/app/investigation/components/CandidateSourceMap.tsx` | Validated candidate water source coordinate spatial map with GPS pins, hover inspect cards, and table fallback | `react` | `CandidateSourceMap` | Candidate Source Spatial Map |
| `frontend/src/app/investigation/components/ResponsePlanner.tsx` | Human-controlled response action checklist with status toggles (`pending` -> `in_progress` -> `completed`), custom action creator modal, and zero autonomous dispatch guardrails | `react`, `src/lib/api.ts` | `ResponsePlanner` | Response Action Planner |

---

## Index Maintenance Rules for Agents

1. **Check First**: Read this table before proposing or editing frontend code to avoid duplicate logic or unnecessary file traversal.
2. **Update Synchronously**: When creating, renaming, refactoring, or deleting any file in `/frontend`, update this table during the same task.
3. **Detail Dependencies**: Clearly state what components or modules are imported and where this file's exports are consumed.
4. **Stitch Traceability**: If a screen or component was generated using Stitch MCP, record the screen ID or design system identifier here.
