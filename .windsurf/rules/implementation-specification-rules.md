# Implementation Specification Rules (TimeTracker)

These rules exist because “rules alone” are often ignored. Start every session by running workflows:
- .windsurf/workflows/rules-read-all.md
- .windsurf/workflows/read-core-docs-and-code.md

## Non-negotiables
- Do not implement anything unless the relevant requirements exist in an authoritative doc/spec.
- When something is unclear, update the spec first. No guessing.

## How to write requirements (3 buckets)

### A) Functional Requirements (FR) — “what the user can do / see”
Write FR as user-observable behavior.

Good:
- “User can create a time entry with start/end, activity, and category.”
Bad:
- “Use store X and component Y.”

### B) Implementation Guarantees (IG) — “must be true regardless of implementation”
Write IG as constraints/outcomes, not as design.

Good:
- “All changes are persisted locally and survive refresh/offline.”
- “Month navigation does not lose unsaved edits; user is warned or changes are autosaved.”
Bad:
- “Use IndexedDB library Z.”

### C) Design Decisions (DD) — “we choose this on purpose”
Use DD for deliberate choices that you want stable:
- naming conventions
- UI conventions (button order, labels)
- data model constraints
- file layout rules

## Rule of thumb
If you want freedom: put it in IG.
If you want it exactly: put it in DD.

## Required format for new/updated specs
Any spec for a feature MUST contain:
1) Problem / Goal
2) Scope (in/out)
3) FR (numbered)
4) IG (numbered)
5) DD (numbered, optional)
6) Acceptance checks (numbered, testable)
7) Change log (date + summary)

## Verification loop (mandatory)
After implementing:
1) Verify against FR/IG/DD and list each requirement with PASS/FAIL.
2) If FAIL:
   - If spec was clear → fix code.
   - If spec allowed multiple interpretations → tighten spec, then fix code.
