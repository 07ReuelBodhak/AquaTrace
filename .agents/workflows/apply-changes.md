# Apply Changes Workflow (`/apply-changes`)

Use this workflow when the user reviews a completed task and requests fixes, adjustments, or corrections before approving it.

## Workflow Execution Steps

1. **Review Feedback & Target Files**:
   - Parse the user's requested changes for the current task (`Awaiting My Review`).
   - Consult `/docs/file-index/frontend.md` and `/docs/file-index/backend.md` to identify the precise files requiring edits.
   - If changes alter endpoints, schemas, or CSV columns, update `/docs/api-contract.md` first and highlight the modification.

2. **Execute Adjustments**:
   - Route frontend corrections to **`frontend-developer`** (maintain Stitch MCP design principles, health officer UI aesthetics, `/frontend` folder boundary).
   - Route backend corrections to **`backend-developer`** (maintain `/backend/.venv`, `requirements.txt`, `/backend` folder boundary).
   - Do NOT write or execute tests; do NOT run the application.

3. **Synchronize Documentation**:
   - Activate **`docs-keeper`**:
     - Update `/docs/file-index/frontend.md` and `/docs/file-index/backend.md` for any modified or new files.
     - Append adjustment notes in the `TASKS.md` Change Log.
     - Keep task status as `Awaiting My Review` (or transition to `Done` once the user explicitly confirms approval).

4. **Report & Await Approval**:
   - Report the exact modifications made to each file.
   - Wait for user feedback or approval before advancing to any subsequent task.
