# Add Features Workflow (`/add-features`)

Use this workflow after project completion when the user requests new features or extensions to AquaTrace.

## Workflow Execution Steps

1. **Ingest Feature Request & Identify Scope**:
   - Analyze the new feature requirements provided by the user.
   - If any domain scope or guidance details are ambiguous, stop and ask the user for clarification.

2. **Locate Target Files via File Indices**:
   - Consult `/docs/file-index/frontend.md` and `/docs/file-index/backend.md` to identify existing components, services, and models that will be impacted or extended.
   - Avoid scanning the entire repository.

3. **Update API Contract (if applicable)**:
   - If the new feature requires new endpoints, payload fields, or data structures, draft the changes in `/docs/api-contract.md`.
   - Submit the contract update for user approval.

4. **Append New Tasks in `/docs/tasks/TASKS.md`**:
   - Add new sequential tasks to the ordered task list (e.g. `TASK-0X`) with status `Not Started`.
   - Define frontend scope (Stitch MCP), backend scope (`/backend/.venv`), and manual acceptance criteria.
   - Present the new task plan for user review.

5. **Execution Cadence**:
   - Execute newly added tasks strictly one at a time using `/run-next-task`.
   - Update file indices and change logs synchronously after each task.
