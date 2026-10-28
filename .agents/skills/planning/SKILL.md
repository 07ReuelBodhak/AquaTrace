---
name: planning
description: Decomposes the AquaTrace SRS into discrete ordered tasks in TASKS.md and authors the initial api-contract.md before coding begins.
---

# Planning Skill

Use this skill when initializing the task roadmap from the SRS, defining new features, or restructuring the development sequence.

## Procedure

1. **Review Requirements**:
   - Inspect the SRS and data specifications in `/docs`.
   - Identify domain boundaries: water sources, officer uploads, geographic clustering, risk scoring, response planning, and reporting.

2. **Draft the API Contract**:
   - Fill in `/docs/api-contract.md` with planned endpoints, HTTP methods, payload schemas, error structures, and CSV column requirements.
   - Present the draft contract to the user for formal approval before scheduling coding tasks.

3. **Break Down Tasks into `/docs/tasks/TASKS.md`**:
   - Formulate small, incremental tasks where frontend and backend work can proceed in parallel against `api-contract.md`.
   - Include clear acceptance criteria for manual user testing.
   - Strictly order tasks sequentially.

4. **Surface Ambiguities**:
   - If any calculation, guidance formula, or third-party service is unspecified, pause and ask the user rather than guessing.
