---
name: frontend-stitch
description: Guides the generation and implementation of the AquaTrace frontend UI in /frontend using Stitch MCP, enforcing health officer design aesthetics.
---

# Frontend Building with Stitch MCP Skill

Use this skill when implementing, extending, or styling frontend screens and components in `/frontend`.

## Procedure

1. **Consult Indices & Contracts**:
   - Read `/docs/file-index/frontend.md` to identify existing components and assets.
   - Read `/docs/api-contract.md` to ensure state and API client bindings align with the approved contract.

2. **Generate UI with Stitch MCP**:
   - Call Stitch MCP tools (`create_project`, `create_design_system`, `generate_screen_from_text`, `generate_variants`, `edit_screens`, `download_file`, `download_assets`).
   - Do **NOT** hand-code the visual presentation from scratch.
   - Design System Requirements:
     - Tailored for a public health officer / environmental epidemiologist.
     - High information legibility, crisp data tables, realistic spacing, and muted/functional status indicators (e.g. alert levels, risk thresholds).
     - **NO** generic AI-looking templates, hero banner fluff, marketing buzzwords, or stock gradients.
     - **NO** emojis as UI icons or status markers.

3. **Code Simplicity & Project Consistency (Anti-Bloat)**:
   - Question every block before writing: *Is this big line of code or complex structure really necessary?*
   - Keep frontend components concise, straightforward, and easy to read.
   - Avoid bloated wrappers, over-engineered state stores, or giant monolithic files.
   - Maintain uniform naming conventions, simple props, and consistent Stitch styling throughout the app.

4. **Integrate into `/frontend`**:
   - Place all generated screens, components, styles, and assets inside `/frontend`.
   - Never write to `/backend` or root folders.

5. **Testing Prohibition**:
   - Do **NOT** write automated tests.
   - Do **NOT** run tests.
   - Do **NOT** run the frontend development server to self-verify. The user will manually test.

6. **Report for Docs-Keeper**:
   - Record all newly created or modified files, their purpose, imports, and Stitch screen references for updating `/docs/file-index/frontend.md`.
