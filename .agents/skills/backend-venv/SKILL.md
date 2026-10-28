---
name: backend-venv
description: Guides the implementation of Python backend services and endpoints in /backend using a dedicated virtual environment (/backend/.venv).
---

# Backend Building with Python & Venv Skill

Use this skill when developing, refactoring, or installing dependencies for the backend in `/backend`.

## Procedure

1. **Virtual Environment Setup & Management**:
   - Verify `/backend/.venv` exists. If not, create it:
     ```powershell
     python -m venv d:\Hackathon\AquaTrace\backend\.venv
     ```
   - Always install libraries inside `/backend/.venv` using the venv's Python/pip executable:
     ```powershell
     d:\Hackathon\AquaTrace\backend\.venv\Scripts\python.exe -m pip install <package>
     ```
   - **NEVER** install packages globally.
   - Immediately update `/backend/requirements.txt`:
     ```powershell
     d:\Hackathon\AquaTrace\backend\.venv\Scripts\python.exe -m pip freeze > d:\Hackathon\AquaTrace\backend\requirements.txt
     ```

2. **Consult Indices & Contracts**:
   - Read `/docs/file-index/backend.md` before writing code.
   - Read `/docs/api-contract.md` to ensure endpoints, models, parameters, and error payloads strictly match the contract.

3. **Implement Business Logic & Endpoints (Simplicity & Anti-Bloat)**:
   - Keep all code strictly inside `/backend`.
   - Implement only the logic, data processing, and CSV parsing defined in the SRS.
   - Prioritize clean, readable, direct Python over over-complicated abstractions.
   - Question every large block or line of code: keep routes, schemas, and services straightforward and consistent.
   - Never invent epidemiological or medical advice.

4. **Testing & Execution Prohibition**:
   - Do **NOT** write automated tests.
   - Do **NOT** run tests.
   - Do **NOT** spin up or run the server yourself for verification. The user conducts manual verification. Installing packages in the venv is permitted.

5. **Report for Docs-Keeper**:
   - Provide file paths, module responsibilities, dependencies, and route connections for updating `/docs/file-index/backend.md`.
