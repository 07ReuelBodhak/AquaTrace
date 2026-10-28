---
name: file-index-keeper
description: Updates the frontend and backend file indexes and task logs after each task to maintain clear documentation and avoid scanning all files.
---

# File Index & Task Log Maintenance Skill

Use this skill at the conclusion of every development task to synchronize documentation with codebase modifications.

## Procedure

0. **Token-Optimized Model Execution**:
   - Always run this skill using `Model: 'flash_lite'` to avoid high inference costs on repetitive tabular edits.
   - Do not scan directories or read full source code files; use only the metadata handed off by the developers.

1. **Collect Task Outputs**:
   - Gather the list of created, modified, renamed, or deleted files from `frontend-developer` and `backend-developer`.
   - Identify the features implemented during the task.

2. **Update Frontend Index (`/docs/file-index/frontend.md`)**:
   - For every affected frontend file, insert or update its table row with:
     - Full path relative to `/frontend`
     - Concise purpose statement
     - Upstream imports / dependencies
     - Downstream components / route usages
     - Associated Stitch screen / design system token

3. **Update Backend Index (`/docs/file-index/backend.md`)**:
   - For every affected backend file, insert or update its table row with:
     - Full path relative to `/backend`
     - Concise purpose statement
     - Upstream imports / models
     - Connected API routes / consumers
     - Required packages in `/backend/requirements.txt`

4. **Update Task Log & Status (`/docs/tasks/TASKS.md`)**:
   - Transition task status from `In Progress` to `Awaiting My Review`.
   - Add a row to the `Task Change Log` recording:
     - Timestamp
     - Task ID
     - List of modified files
     - Summary of implemented features
     - Status transition

5. **Generate Completion Report**:
   - Prepare the structured user report:
     - Features implemented
     - File manifest with what each file does
     - Explicit prompt informing the user to test manually and provide feedback or approval before starting the next task.
