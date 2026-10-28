# Run Next Task Workflow (`/run-next-task`)

Use this workflow to execute the next pending task from `TASKS.md` using parallel frontend and backend subagents, followed by documentation updates and the completion report.

## Workflow Execution Steps

1. **Identify the Next Task & Pre-Flight Checks**:
   - Inspect `/docs/tasks/TASKS.md` for the first task with status `Not Started`.
   - **Zero Hallucination / Manual Input Check**: If the task requires external API keys, service tokens, or manual setup, **STOP and ask the user before starting execution**. Never hallucinate keys or environment values.
   - Update its status to `In Progress`.
   - If no tasks remain, inform the user that all scheduled tasks are complete.

2. **Parallel Agent Execution (Token-Optimized)**:
   - Spawn / invoke the **`frontend-developer`** subagent (`Model: 'flash'`):
     - Has direct filesystem read/write/edit tools (`enable_write_tools: true`) and Stitch MCP tools (`enable_mcp_tools: true`).
     - Directly creates and modifies files strictly within `/frontend`.
     - Consults `/docs/file-index/frontend.md` (no recursive folder scans).
     - Generates UI and design components using **Stitch MCP**.
     - Coordinates with backend purely via `/docs/api-contract.md`.
     - Uses targeted line ranges (`StartLine`/`EndLine`) when inspecting existing files.
     - Does NOT write or execute tests.
     - Directly saves files to disk and returns a compact manifest of changes.
   - Spawn / invoke the **`backend-developer`** subagent in parallel (`Model: 'flash'`):
     - Has direct filesystem read/write/edit tools (`enable_write_tools: true`).
     - Directly creates and modifies files strictly within `/backend`.
     - Consults `/docs/file-index/backend.md` (no recursive folder scans).
     - Operates strictly inside `/backend/.venv` (installs libraries inside venv, updates `requirements.txt`).
     - Implements endpoints conforming strictly to `/docs/api-contract.md`.
     - Uses targeted line ranges (`StartLine`/`EndLine`) when inspecting existing files.
     - Does NOT write or execute tests.
     - Directly saves files to disk and returns a compact manifest of changes.

3. **Documentation Update via Docs-Keeper (`Model: 'flash_lite'`)**:
   - Once both agents complete their work, invoke the **`docs-keeper`** subagent using `Model: 'flash_lite'`:
     - Has direct filesystem read/write/edit tools (`enable_write_tools: true`).
     - Directly updates `/docs/file-index/frontend.md` with newly created or modified frontend files.
     - Directly updates `/docs/file-index/backend.md` with newly created or modified backend files.
     - Directly updates `/docs/tasks/TASKS.md`: transitions status to `Awaiting My Review` and appends an entry to the Task Change Log.
     - Returns only the updated table rows.

4. **Completion Report & Stop**:
   - Output the formal task report:
     1. **Features Implemented**: Clear list of functionality added in this task.
     2. **File Manifest**: Every file created or changed, and what it does.
   - **STOP** and wait for the user. Do **NOT** run the app or execute tests. Do **NOT** proceed to the next task until the user explicitly tests and approves.
