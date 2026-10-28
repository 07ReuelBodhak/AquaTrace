# Plan Tasks Workflow (`/plan-tasks`)

Use this workflow to decompose the AquaTrace SRS into discrete ordered tasks, draft the initial API contract, and initialize the roadmap.

## Workflow Execution Steps

1. **Activate Planner & Ingest SRS**:
   - Activate the `planner` agent and the `planning` skill.
   - When the user announces they provided the SRS, read through the entire SRS and all dataset specifications in `/docs` to gain a deep understanding of the architecture and domain requirements.
   - Begin task planning and building directly based on the user's prompt.
   - If any task requires external API keys, service credentials, tokens, or manual setup, **STOP and ask the user before proceeding** (do not hallucinate credentials).
   - Identify open or ambiguous scopes (e.g. Response Planner algorithms, external services) and ask the user for clarification before planning them.

2. **Draft the API Contract**:
   - Populate `/docs/api-contract.md` with planned endpoints, HTTP methods, payload schemas, standard error format, and required CSV column names.
   - Present the draft contract to the user.

3. **Formulate Tasks in `/docs/tasks/TASKS.md`**:
   - Break requirements into numbered tasks (`TASK-01`, `TASK-02`, etc.).
   - Ensure each task strictly separates `/frontend` (Stitch UI) and `/backend` (Python venv).
   - Verify that tasks are ordered sequentially with clear acceptance criteria for manual testing.

4. **User Review Gate**:
   - Stop and present the proposed task breakdown and API contract to the user.
   - Do **NOT** write any application code until the user explicitly approves the plan.
