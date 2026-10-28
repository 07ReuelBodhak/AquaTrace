# AquaTrace Project Invariants & Agent Rules

These rules are permanent and mandatory for all agents and subagents operating on the AquaTrace codebase. Every agent must strictly observe these constraints during every step of planning, development, and documentation.

---

## 1. Directory & Code Boundaries
- **Frontend Code**: Resides strictly in `/frontend`. No frontend files may be created or modified outside this directory.
- **Backend Code**: Resides strictly in `/backend`. No backend files may be created or modified outside this directory.
- **Root & Documentation**: Documentation belongs in `/docs`. Customizations belong in `.agents/`. Do not pollute the repository root with ad-hoc scripts, temporary files, or misplaced assets.

---

## 2. Backend Environment & Python Invariants
- **Python Runtime**: Backend is built using Python.
- **Virtual Environment**: Always create and use the local virtual environment located strictly at `/backend/.venv`.
- **Package Installation**: Every package/library must be installed inside `/backend/.venv`. **NEVER** install packages globally or outside `/backend/.venv`.
- **Dependency Tracking**: Always maintain and keep `/backend/requirements.txt` updated whenever dependencies are added, updated, or removed.

---

## 3. Frontend & Stitch MCP Invariants
- **UI Generation**: All frontend visual UI layouts and components must be generated using the **Stitch MCP**. Do **NOT** hand-write visual screen layouts from scratch.
- **Design Quality & Aesthetics**: The finished application must look and feel professionally human-designed:
  - **NO** generic AI-looking layouts or stock hero sections.
  - **NO** stock gradients or generic marketing fluff.
  - **NO** emoji decorations in user-facing UI or clinical dashboards.
  - **Realistic Spacing & Typography**: Spacing, typography, visual weight, and terminology must be tailored specifically for a public health officer / environmental epidemiologist tool.

---

## 4. Strict Testing & Verification Prohibition (Zero Tests Invariant)
- **NO Test Files**: Do **NOT** create test files (`test_*.py`, `*_test.py`, `*.spec.*`, `*.test.*`, or any folder named `tests/` or `test/`).
- **NO Test Libraries**: Do **NOT** install or add test libraries (`pytest`, `unittest`, `jest`, `mocha`, `cypress`, `playwright`, etc.) to `requirements.txt` or `package.json`.
- **NO Test Execution**: Do **NOT** run test commands (`pytest`, `python -m unittest`, `npm test`, `npm run test`, etc.).
- **NO App Self-Verification**: Do **NOT** run the application server, frontend dev server, or background watchers to self-verify. The user executes all testing and verification manually.
- **Permitted Verification**: Installing required dependencies inside `/backend/.venv` or running build syntax linters/type checks is permitted.

---

## 5. Execution Cadence & Human-in-the-Loop Workflow
- **One Task at a Time**: Work strictly on **ONE** task at a time from `/docs/tasks/TASKS.md`. Never start multiple tasks concurrently or jump ahead.
- **Completion Reporting**: When a task is complete, immediately stop and report:
  1. **Features Implemented**: Clear list of features completed.
  2. **File Manifest**: Exactly what each file created or changed does.
- **Awaiting Approval**: Wait for user review. The user will test and may request fixes or changes.
- **Apply Changes**: Apply all requested user adjustments before starting the next task.
- **Advance Only on Instruction**: Proceed to the subsequent task only when the user explicitly instructs to do so.

---

## 6. Domain Integrity & Scientific Scope
- **NO Speculative Guidance**: Never invent medical, epidemiological, or water-treatment guidance.
- **SRS Fidelity**: Implement strictly what the project SRS specifies.
- **Clinical & Diagnostic Boundaries**: The app does **NOT** diagnose human illness, does **NOT** claim to provide conclusive proof of contamination, and does **NOT** replace certified laboratory testing.
- **Scope Ambiguities**: If the SRS leaves any feature scope open or ambiguous (e.g., specific algorithms for Response Planner), pause and ask the user before building it.

---

## 7. File Index & API Contract Discipline
- **Pre-Edit Code Verification**: Before writing, modifying, or refactoring code in any file, **ALWAYS inspect and read the current file state on disk first**. Verify you are building against the latest version and never overwrite unseen changes.
- **Consult Index First**: Before searching or scanning the codebase, agents must read `/docs/file-index/frontend.md` and `/docs/file-index/backend.md` to identify relevant files.
- **Synchronous Index Updates**: Whenever a file is created, renamed, deleted, or meaningfully altered, update its corresponding entry in the file index in the same task.
- **API Contract Authority**: `/docs/api-contract.md` is the single source of truth for the interface between frontend and backend (endpoints, request/response schemas, error shapes, CSV formats).
- **Contract Change Approval**: Never modify the API contract unilaterally. Always update `/docs/api-contract.md` and obtain explicit user approval before implementing changes.

---

## 8. Token Conservation & Cost Efficiency
- **Subagent Model Tier Routing**:
  - `docs-keeper`: Must always be invoked with `Model: 'flash_lite'` to minimize token cost on repetitive markdown indexing.
  - `frontend-developer` & `backend-developer`: Default to `Model: 'flash'` for routine components, state management, schemas, and endpoint logic; escalate to `inherit` only for complex algorithms.
  - `planner`: Uses `inherit` or `pro` for high-reasoning task breakdown, SRS edge-case analysis, and contract design.
- **Index-First Discovery**: Agents must **NEVER** run recursive file scans (`Get-ChildItem -Recurse`, bulk tree listings, or multi-directory grep). Always locate files directly through `/docs/file-index/`.
- **Targeted Line-Range Reads**: When reading source code, avoid dumping entire large files into context. Specify `StartLine` and `EndLine` for the target function or block.
- **Concise Summaries**: Subagents must return compact completion summaries (file manifest + status), omitting full-file prints or excessive conversational narration.

---

## 9. Prompt-Driven Execution & Zero Hallucination
- **Prompt-Driven Start**: When the user provides a prompt instructing to start building, immediately begin building strictly according to that prompt's direction and scope.
- **Zero Hallucination & Credential Gate**: Never hallucinate credentials, API keys, secrets, environment variables, URLs, or library versions. If any task requires an API key, external service credentials, or manual configuration, **STOP and ask the user BEFORE executing the task**.
- **SRS Ingestion Protocol**: When the user indicates that they have provided the SRS (e.g. "I provided SRS" or shares the document path/content), thoroughly read and inspect the entire SRS to understand the project deeply before defining tasks or writing code.

---

## 10. Multi-Agent Delegation Invariant
- **Mandatory Subagent Delegation**: The primary orchestrator must **NOT** monopolize implementation by writing all frontend and backend code itself in a single prompt. It MUST invoke the dedicated subagents (`frontend-developer`, `backend-developer`, `docs-keeper`) using `invoke_subagent`.
- **Surfaces & IDE Integration**: Subagent calls run seamlessly across Antigravity surfaces. When working in IDEs (like IntelliJ IDEA), ensure Agent Mode is enabled in settings or run `agy` in the IDE terminal to leverage full multi-agent orchestration.

---

## 11. Code Simplicity, Clean Architecture & Anti-Bloat (KISS Principle)
- **Pre-Code Necessity Check**: Before writing any code, pause and evaluate: *Is this complexity and line count truly necessary? Can this feature be built with fewer, cleaner, and more direct lines of code?*
- **Frontend Simplicity**: Avoid bloated monolithic files, deeply nested component trees, premature abstractions, or convoluted state machines. Keep frontend components concise, readable, and focused.
- **No Unnecessary Complications**: Build the web app to be clear and easy to understand. Never introduce unnecessary architecture layers, speculative helpers, or bloated boilerplate.
- **Project-Wide Consistency**: Maintain uniform patterns, clean naming conventions, standard error handling, and consistent data structures throughout the entire codebase.




