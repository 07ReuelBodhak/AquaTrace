# AquaTrace

> Evidence-based waterborne outbreak investigation and response-prioritisation platform for public health officers and field epidemiologists.

## Overview
AquaTrace equips field investigators with deterministic statistical tools to evaluate candidate water sources, inspect $2 \times 2$ contingency tables, track outbreak timelines without future-data leakage, and prioritize response containment tasks.

## System Architecture
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS with the strict 4-color **High-Contrast Slate** design system (`#111827`, `#374151`, `#F3F4F6`, `#FFFFFF`).
- **Backend**: FastAPI (Python), deterministic epidemiological calculation engine ($2 \times 2$ matrix, attack rates, relative risk, Wald 95% CI, Haldane-Anscombe zero-cell correction), asynchronous state storage.
- **Documentation**: `/docs/tasks/TASKS.md`, `/docs/contracts/api-contract.md`, `/docs/file-index/`.

## Getting Started

### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Unix/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev -- -p 3000
```
Visit `http://localhost:3000` for the landing page and `http://localhost:3000/investigation` for the health officer workstation.
