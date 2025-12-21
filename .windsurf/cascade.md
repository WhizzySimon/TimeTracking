# TimeTracker — Cascade Project Instructions

## Start-of-session workflow (mandatory)
Before doing anything else, run:
- /project-start
Follow its instructions and paste the requested one-line outputs.
If anything is missing/fails, STOP and fix that first.

## CRITICAL: Read This First (Every Chat Session)

This project uses **Spec-Driven Development**. You MUST follow this process strictly.

### Step 1: Load Documentation Index
**Before doing ANYTHING else, read:**
```
Docs/INDEX.md
```

This file lists all authoritative documents and their priority order.

### Step 2: Load Process Rules
**Then read:**
```
AGENTS.md
```

This defines the 4-phase development process you must follow.

### Step 3: Follow the Process
Do NOT start coding until you have:
1. ✅ Read `Docs/INDEX.md`
2. ✅ Read `AGENTS.md`
3. ✅ Read relevant docs from INDEX.md for the current task
4. ✅ Verified that Spec + Plan + Tasks exist for the feature
5. ✅ Listed what you read in a "Doc Inventory" section at the top of your response

### Step 4: Start Every Response With Doc Inventory
**Format:**
```markdown
# Doc Inventory
**Docs Read:**
- Docs/INDEX.md
- AGENTS.md
- Docs/Guidelines/ui-logic-spec-v1.md (sections X, Y)
- Docs/Plans/feature-name.md

**Conflicts:** None (or describe which doc won by priority)
**Assumptions:** None (or list + where they should be documented)
```

---

## Development Process (4 Phases)

### Phase 1 — SPEC (what/why)
- Location: `Docs/Specs/<feature-slug>.md`
- Must contain: Problem, Users, Scope, Acceptance criteria, Edge cases, Data/privacy, Non-goals
- Checkpoint: No ambiguous terms remain

### Phase 2 — PLAN (how)
- Location: `Docs/Plans/<feature-slug>.md`
- Must contain: Architecture, Data model, UI state, Error handling, Testing strategy
- Checkpoint: Can be executed as tasks without new decisions

### Phase 3 — TASKS (small steps)
- Location: `Docs/Tasks/<feature-slug>.md`
- Each task: 0.5-2h, files touched, done criteria, verification steps, guardrails
- Checkpoint: No task depends on "figure it out while coding"

### Phase 4 — IMPLEMENT (one task at a time)
- Implement tasks in order
- Verify each task using commands from `package.json`
- Update docs if reality differs from plan

---

## Conflicts / source of truth

If multiple sources conflict, follow **Docs/INDEX.md** (explicit priority order).

No other priority list in this repo is authoritative.  
If Docs/INDEX.md does not cover the situation, STOP and propose updating the relevant doc/spec instead of guessing.

---

## Verification Rules

Before marking any task complete:
- Run actual scripts from `package.json` (do not invent commands)
- Run fastest checks first: `npm run check`, `npm run lint`, `npm run test:unit`, then `npm run test:e2e`
- State exactly what you ran and what passed
- If you cannot run something, state why

### Testing Requirements
- **Unit tests required** for all business logic (calculations, date utils, validation)
- Write tests in same directory as implementation: `file.ts` → `file.test.ts`
- Use Vitest for unit tests (fast, Vite-native)
- All tests must pass before marking task complete
- See `Docs/TESTING_STRATEGY.md` for details

---

## Coding Rules

- Do NOT refactor "for cleanliness" unless explicitly tasked
- If you change behavior, update acceptance criteria and tests
- Prefer pure functions + small modules
- Avoid hidden coupling: pass data explicitly
- Follow PWA/SvelteKit rules exactly as documented in project docs

---

## Communication Style

Structure every response:
1. Doc Inventory (what you read)
2. What you understood (bullets)
3. What you will change (files + bullets)
4. Implementation notes (only what matters)
5. Verification you ran (exact commands) + results
6. Any spec/plan/tasks updates required

---

## Critical Reminders

❌ **DO NOT:**
- Start coding without reading Docs/INDEX.md + AGENTS.md
- Skip the Doc Inventory section
- Implement without a plan + tasks document
- Guess at requirements (update docs instead)
- Invent verification commands (use package.json scripts)

✅ **DO:**
- Read INDEX.md first, every time
- List what you read in Doc Inventory
- Follow the 4-phase process strictly
- Verify tasks before marking complete
- Update docs when reality differs from plan

---

## Quick Reference

**Key Files:**
- `Docs/INDEX.md` — Doc index (read first)
- `AGENTS.md` — Process rules (read second)
- `Docs/Guidelines/ui-logic-spec-v1.md` — Product spec (what to build)
- `Docs/Guidelines/technical-guideline-v1.md` — Architecture (how to build)
- `Docs/Plans/timetracker-v1-implementation.md` — Implementation plan
- `Docs/Tasks/timetracker-v1-implementation.md` — Task breakdown
- `Docs/IMPLEMENTATION_PROGRESS.md` — Progress tracker (update after each task)
- `Docs/TESTING_STRATEGY.md` — Unit testing requirements

**Verification Commands (User-Executed):**
Cascade creates PowerShell scripts under `scripts/`. User runs them and pastes output back.

- `npm run check` — TypeScript type check
- `npm run lint` — ESLint + Prettier check
- `npm run format` — Auto-format code
- `npm run test:unit` — Vitest unit tests (business logic)
- `npm run test:e2e` — Playwright E2E tests
- `npm run build` — Production build
- `npm run preview` — Test production build

---

**If you see this file, you are ready to work on TimeTracker. Start by reading Docs/INDEX.md.**
