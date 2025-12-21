# TimeTracker — Spec-Driven Development Guide for Cascade

This repo uses Spec-Driven Development: we write/maintain specs that drive implementation.
Primary rule: DO NOT start implementing until the spec + plan + tasks are explicit and internally consistent.

## Start-of-session workflow (mandatory)
Before doing anything else, run:
- project-start
Follow its instructions and paste the requested one-line outputs.
If anything is missing/fails, STOP and fix that first.


## Mandatory doc loading (non-negotiable)
Before planning or coding, ALWAYS:
1) Read: Docs/INDEX.md
2) Read ONLY the docs referenced in Docs/INDEX.md that are relevant to the task
3) Start every response with a "Doc Inventory" section listing exactly what was read (exact file paths + headings/sections used)
If required info is missing, STOP and propose an update to the relevant doc (spec/plan/tasks) before coding.

## Source of truth
- If multiple sources conflict, follow Docs/INDEX.md (explicit priority order).
- If Docs/INDEX.md does not cover something, STOP and propose updating the relevant doc/spec instead of guessing.

## Process (must follow in order)
We work in 4 phases. Each phase has a checkpoint and must be updated before moving on.

### Phase 1 — SPEC (what/why)
Goal: capture intent without locking into implementation too early.
For any non-trivial change, create/update a spec file:

- Docs/Specs/<feature-slug>.md

Use the spec template in Docs/Specs/_template.md and follow Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md.

Each spec MUST contain:
- Problem statement (1–3 sentences)
- Explicit scope (in scope / out of scope)
- Functional Requirements (FR) — user-observable behavior (TT-FR-001, TT-FR-002, ...)
- Implementation Guarantees (IG) — constraints/outcomes that must hold (TT-IG-001, TT-IG-002, ...)
- Design Decisions (DD) — deliberate choices to lock in (TT-DD-001, TT-DD-002, ...) (optional)
- Edge cases + failure states
- Data & privacy notes (what is stored, where, retention)
- Acceptance checks (testable, mapped to FR/IG/DD)
- Change log

Checkpoint to proceed:
- No ambiguous terms remain (e.g., "fast", "simple", "works offline") without a measurable definition.
- All FR/IG/DD are numbered and testable.

### Phase 2 — PLAN (how)
Goal: choose architecture/approach and write it down before code.
Create/update:

- Docs/Plans/<feature-slug>.md

Each plan MUST contain:
- A minimal architecture sketch (components/modules + responsibilities)
- Data model changes (if any)
- UI state model (what state exists, where it lives)
- Error handling strategy
- Performance/UX constraints relevant to the feature
- Testing approach (unit/integration/e2e; what is realistically automatable)

Checkpoint to proceed:
- Plan can be executed as tasks without requiring new decisions.

### Phase 3 — TASKS (small, verifiable steps)
Goal: break plan into reviewable, independently testable units.
Create/update:

- Docs/Tasks/<feature-slug>.md

Rules:
- Tasks MUST be small (ideally 0.5–2h human-sized).
- Each task MUST include:
  - Files likely touched (best guess)
  - What "done" means (including how to verify)
  - Any guardrails (must not change X, must preserve Y)

Checkpoint to proceed:
- No task depends on “figure it out while coding”.

### Phase 4 — IMPLEMENT (one task at a time)
Rules for implementation:
- Implement tasks strictly in order unless the tasks doc is updated first.
- Prefer minimal diffs and incremental commits.
- Do not introduce new dependencies unless the plan explicitly calls for it.
- Preserve existing working behavior unless the spec explicitly changes it.
- If something is unclear during coding, STOP and update the spec/plan/tasks first.

Definition of done for a task:
- Code changes completed
- Verification executed (see "Verification" section)
- Notes written back into the relevant spec/plan/tasks if reality differed from assumptions

## Verification (no guessing)
Before marking any task complete:
- Use the repo’s actual scripts from package.json (do not invent commands).
- Run the fastest relevant checks first (format/lint/typecheck), then tests.
- If e2e exists (e.g., Playwright), run only the impacted suite when possible.

When reporting completion:
- State exactly what you ran and what passed.
- If you could not run something, state why (missing script, environment, etc.).

## Coding rules (agent-friendly)
- Do not do broad refactors "for cleanliness" unless explicitly tasked.
- If you change behavior, update acceptance criteria and tests.
- Prefer pure functions + small modules over large multi-purpose files.
- Avoid hidden coupling: pass data explicitly; document invariants.

## PWA / platform constraints
- Follow the repo’s PWA/SvelteKit/platform rules exactly as documented in the project docs.
- If a requirement conflicts with browser constraints, document the constraint in the spec and propose the smallest viable alternative.

## Where to put long-lived knowledge
- Project-wide rules: keep in this AGENTS.md (short, stable).
- Feature detail: Docs/Specs/ + Docs/Plans/ + Docs/Tasks/.
- If instructions get long, split into additional docs and reference them from the spec/plan (do not bloat AGENTS.md).

## Communication style for Cascade output
When responding in chat, always output in this structure:
1) What you understood (bullets)
2) What you will change (files + bullets)
3) Implementation notes (only what matters)
4) Verification you ran (exact commands) + results
5) Any spec/plan/tasks updates required
