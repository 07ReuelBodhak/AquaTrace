# Frontend File Index (`/frontend`)

This document tracks all files inside the `/frontend` directory. Agents must consult this index before modifying or adding files, rather than scanning the entire directory. Whenever a frontend file is created, moved, renamed, or modified, its entry in this table must be updated immediately in the same task.

---

## File Registry

| File Path | Purpose / Responsibility | Imports / Upstream Dependencies | Exported Components / Downstream Usage | Stitch Screen / Source Reference |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/tailwind.config.ts` | Configures strict 4-color High-Contrast Slate palette (`ink`, `slate`, `mist`, `white`) and zero-radius corners | `tailwindcss` | Tailwind utility classes | High-Contrast Slate System |
| `frontend/src/app/globals.css` | 4-color CSS tokens, accessibility focus-visible rings, reduced motion support, clinical scrollbar | Tailwind directives | Global styling | High-Contrast Slate System |
| `frontend/src/lib/api.ts` | Type-safe API client wrapper for `/api/v1` endpoints strictly matching API contract | `fetch`, TypeScript interfaces | `api`, `HealthResponse`, `DatasetUploadResponse`, `AnalysisResponse`, `ApiClientError` | `/docs/api-contract.md` |
| `frontend/src/app/layout.tsx` | Clean root layout: Geist fonts, metadata, and smooth scrolling | `next/font/local`, `globals.css` | `RootLayout` | Root Application Shell |
| `frontend/src/app/page.tsx` | Premium AquaTrace Landing Page with 9 sections, responsive layouts, synthetic evidence matrix preview | `react`, `next/link` | `AquaTraceLandingPage` | Premium Public Health Landing Page |
| `frontend/src/app/investigation/layout.tsx` | Workstation shell: top navigation, telemetry status readout, meta command ribbon, audit footer | `react` | `InvestigationLayout` | Outbreak Workstation Shell |
| `frontend/src/app/investigation/page.tsx` | Health Officer Outbreak Dashboard: 4 KPI summary cards, CSV upload dropzone, 1-click synthetic demo loader, candidate water source prioritisation table with sorting/filtering, and interactive 2x2 contingency matrix inspection drawer | `react`, `src/lib/api.ts` | `Home` | Outbreak Workstation Dashboard |

---

## Index Maintenance Rules for Agents

1. **Check First**: Read this table before proposing or editing frontend code to avoid duplicate logic or unnecessary file traversal.
2. **Update Synchronously**: When creating, renaming, refactoring, or deleting any file in `/frontend`, update this table during the same task.
3. **Detail Dependencies**: Clearly state what components or modules are imported and where this file's exports are consumed.
4. **Stitch Traceability**: If a screen or component was generated using Stitch MCP, record the screen ID or design system identifier here.
