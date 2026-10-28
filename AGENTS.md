# AquaTrace Project Rules

All agents operating in this workspace must strictly follow the rules defined in [project-rules.md](file:///d:/Hackathon/AquaTrace/.agents/rules/project-rules.md):

1. **Strict Directories**: Frontend code only in `/frontend`, backend code only in `/backend`.
2. **Python Environment**: Always create and use `/backend/.venv`. Never install packages globally. Keep `/backend/requirements.txt` updated.
3. **UI via Stitch MCP**: Visual layouts must be generated with Stitch MCP. Human-designed health officer aesthetics: no stock gradients, no emojis, no AI templates.
4. **Zero Automated Tests / No Test Files / No App Self-Run**: Never create test files (`test_*.py`, `*.spec.*`, `tests/`), never add test libraries, never run tests, and never run the application. Manual testing is performed strictly by the user.
5. **Cadence**: Work on exactly ONE task at a time. Report implemented features and file changes, then stop and wait for user review.
6. **Domain Limits**: Implement only what the SRS specifies. Never invent medical, epidemiological, or water-treatment guidance.
7. **Documentation Discipline**: Always verify current files on disk before editing. Check `/docs/file-index/` before modifying files. Keep `frontend.md`, `backend.md`, `TASKS.md`, and `api-contract.md` synchronized.
8. **Token Optimization**: Use `flash_lite` for docs-keeper, `flash` for standard frontend/backend tasks; read files with line ranges; never run recursive scans.
9. **Zero Hallucination & Credential Gate**: Never guess API keys, credentials, URLs, or manual configs; ask the user before executing. When the user provides the build prompt, build based on that prompt. When the user says they provided the SRS, thoroughly read and analyze it before proceeding.
10. **Multi-Agent Delegation**: Orchestrator must delegate tasks to subagents via `invoke_subagent`, rather than doing everything in a single prompt.
11. **Code Simplicity & Anti-Bloat (KISS)**: Always question if big lines of code are necessary before writing. Avoid over-complicated logic, giant bloated components, and unnecessary abstractions. Keep the web app clean, straightforward, easy to maintain, and consistent throughout the project.
