# Implementation Specification Rules (TimeTracker)

This file is a bootstrap rule set for Cascade. The authoritative source of truth is defined in Docs/INDEX.md.

## Start of session (mandatory)

Start every session by running:

- /project-start

Follow its instructions and paste the requested one-line outputs.

## Source of truth (no guessing)

- If multiple sources conflict, follow Docs/INDEX.md (explicit priority order).
- Do not invent requirements. If something is missing or unclear, propose a doc/spec update first.

## How to write requirements (FR/IG/DD)

Authoritative format:

- Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md
- Docs/Specs/\_template.md

Minimum bar for any feature change:

- FR/IG/DD are numbered, testable, and unambiguous.
- Acceptance checks exist and map to the numbered requirements.

### A) Functional Requirements (FR) - "what the user can do / see"

Write FR as user-observable behavior.

Good:

- "User can create a time entry with start/end, category, and note."
- "User can delete a user-defined category, but cannot delete system categories."

Bad:

- "Use store X and component Y."

### B) Implementation Guarantees (IG) - "must always be true"

Write IG as constraints/outcomes that must hold regardless of implementation details.

Good:

- "System categories always exist and are non-editable and non-deletable."
- "Local persistence is offline-first; data remains available after reload."

Bad:

- "Use localStorage directly in component Z."

### C) Design Decisions (DD) - "deliberate choices"

Write DD to capture intentional choices that could be implemented multiple ways.

Good:

- "Default user categories are seeded from static/default-categories.de.json on first run only."
- "Commands are executed via generated PowerShell scripts; do not assume terminal execution."

Bad:

- "Because I felt like it."

## Verification loop (mandatory)

After implementing:

1. List each relevant FR/IG/DD requirement and mark PASS/FAIL.
2. If any FAIL:
   - If the spec was clear: fix code/tests.
   - If the spec allowed multiple interpretations: tighten the spec first, then fix code/tests.

## Terminal/verification commands

If terminal commands are required:

- Create a PowerShell script under scripts/ (e.g., scripts/milestone*1.ps1 or scripts/verify*<task>.ps1).
- Tell the user the exact one-line command to run it.
- The user runs it and pastes the output back.
- Do not claim you executed commands unless you actually did.
