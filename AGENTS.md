# Cascade Dev Framework — TimeTracker

This repo uses the **Cascade Dev Framework** for spec-driven development with AI coding agents.

The framework includes: specs, plans, tasks, rules, workflows, guidelines, profiles, and tooling.

**Primary rule:** DO NOT start implementing until the spec + plan + tasks are explicit and internally consistent.

## Start-of-session workflow (mandatory)

Before doing anything else, run:

- /project-start
  Follow its instructions and paste the requested one-line outputs.
  If anything is missing/fails, STOP and fix that first.

## Mandatory doc loading (non-negotiable)

Before planning or coding, ALWAYS:

1. Read: Docs/INDEX.md
2. Read ONLY the docs referenced in Docs/INDEX.md that are relevant to the task
3. Start every response with a "Doc Inventory" section listing exactly what was read (exact file paths + headings/sections used)
   If required info is missing, STOP and propose an update to the relevant doc (spec/plan/tasks) before coding.

## Source of truth

- If multiple sources conflict, follow Docs/INDEX.md (explicit priority order).
- If Docs/INDEX.md does not cover something, STOP and propose updating the relevant doc/spec instead of guessing.
- Dateinamen-Konventionen siehe SPEC_DRIVEN_DEVELOPMENT.md; Standard bleibt Docs/Specs/<feature-slug>.md.

## Process (must follow in order)

We work in 4 phases. Each phase has a checkpoint and must be updated before moving on.

### Phase 1 — SPEC (what/why)

Goal: capture intent without locking into implementation too early.
For any non-trivial change, create/update a spec file:

- Docs/Specs/<feature-slug>.md

Use the spec template in Docs/Specs/\_template.md and follow Docs/Guidelines/IMPLEMENTATION_SPECIFICATION_RULES.md.

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

- No task depends on "figure it out while coding".

### Phase -1 — PRE-IMPLEMENTATION GATES (before Phase 4)

Before starting implementation, verify all gates pass:

- [ ] **Simplicity:** ≤3 new files for initial implementation?
- [ ] **Anti-Abstraction:** Using framework directly, no unnecessary wrappers?
- [ ] **Integration-First:** Contracts/interfaces defined before implementation?
- [ ] **Scope-Lock:** No new requirements added since spec approval?
- [ ] **Test-Ready:** At least one acceptance check is automatable?

If any gate fails, update the spec/plan/tasks first.

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
- Git commit & push (see "Git workflow" section below)

## Git workflow (simple)

We use a simple dev/main model:

- **`dev` branch:** All work happens here. Push directly.
- **`main` branch:** Stable releases. Merge from dev when ready.

### Command sequence for Cascade

After completing a task:

```bash
git add -A
git commit -m "feat: description"
git push
```

That's it. No PRs, no branch protection, no CI blocking.

## Verification (no guessing)

Before marking any task complete:

- Use the repo's actual scripts from package.json (do not invent commands).
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

- Follow the repo's PWA/SvelteKit/platform rules exactly as documented in the project docs.
- If a requirement conflicts with browser constraints, document the constraint in the spec and propose the smallest viable alternative.

## Where to put long-lived knowledge (Single Source of Truth)

| Content Type         | Canonical Location                          | Notes                                                             |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| **Process rules**    | `AGENTS.md`                                 | Session workflow, git rules, verification, coding rules           |
| **Always-on rules**  | `.windsurf/rules/*.md`                      | Auto-loaded every session (code-quality, command-execution, etc.) |
| **Workflows**        | `.windsurf/workflows/`                      | ONLY orchestrate — reference docs, never duplicate content        |
| **Doc hierarchy**    | `Docs/INDEX.md`                             | Priority order when docs conflict                                 |
| **Coding standards** | `Docs/Guidelines/`                          | DEVELOPMENT_GUIDELINES, NAMING_CONVENTIONS, etc.                  |
| **Tooling docs**     | `Docs/Tooling/`                             | Watcher, git workflow, bootstrap                                  |
| **Feature specs**    | `Docs/Specs/`, `Docs/Plans/`, `Docs/Tasks/` | Per-feature documentation                                         |
| **Dev history**      | `Docs/Devlog/CHANGELOG.md`                  | One line per commit                                               |
| **Decisions**        | `Docs/Devlog/DECISIONS.md`                  | Architecture/policy decisions (ADR-light)                         |
| **Learnings**        | `Docs/Devlog/LEARNINGS.md`                  | Proven preferences (max 30 bullets)                               |
| **Learnings Inbox**  | `Docs/Devlog/LEARNINGS-INBOX.md`            | Raw feedback capture (unbounded, low priority)                    |

## Self-Learning System

Cascade learns from maintainer feedback via a two-tier system:

- **Inbox:** `Docs/Devlog/LEARNINGS-INBOX.md` — raw capture, unbounded, not read at session start
- **Distillate:** `Docs/Devlog/LEARNINGS.md` — proven preferences, max 30 bullets, read at session start

### When to update

- **Inbox:** After each change set if maintainer gave corrective feedback
- **Distillate:** Only when promotion criteria met (repeated 2+ times across sessions OR explicitly marked by maintainer)

### Distillate entry format

```
- **[Category]** Short statement (1-2 lines)
  - Because: one short clause (optional)
```

Categories: **Hard Rule** | **Preference** | **Reminder**

### Promotion → Enforcement

When a Distillate item is categorized as **Hard Rule**, the same commit should also add it to:

- `.windsurf/rules/` (for always-on enforcement), OR
- `AGENTS.md` (for process-related rules)

### Anti-bloat rules (mandatory)

- Hard cap: 30 bullets max in Distillate
- Merge duplicates before adding new items
- Prune items not referenced in 10+ sessions
- No ephemeral mood — store actionable guidance only

### Rules for Adding/Changing Dev Framework Content

1. **Never duplicate** — If content exists in one location, reference it, don't copy it.
2. **Workflows only orchestrate** — Workflows tell Cascade which docs to read. They must NOT contain rules or commands that could go stale.
3. **Process rules go in AGENTS.md** — Not in workflows, not in guidelines.
4. **Always-on rules go in `.windsurf/rules/`** — These auto-load every session.
5. **If unsure, check `Docs/INDEX.md`** — It defines the priority order.

**CRITICAL:** When adding new process rules (e.g., "always do X after task completion"), add them to AGENTS.md, NOT to individual workflow files. Workflows should reference AGENTS.md sections, not duplicate content.

## Session-end rules (CRITICAL - work must never be lost)

**Before ending any session, Cascade MUST verify:**

1. **Learnings captured:** Review session for corrective feedback → add to `Docs/Devlog/LEARNINGS-INBOX.md`
2. **Learnings promoted:** Check INBOX for items repeated 2+ times → promote to `Docs/Devlog/LEARNINGS.md`
3. **Decisions captured:** If architecture/policy decision was made → add to `Docs/Devlog/DECISIONS.md`
4. **Changelog updated:** `Docs/Devlog/CHANGELOG.md` has entry for this session's work
5. **No uncommitted changes:** Run `git status` — working tree must be clean
6. **No unpushed commits:** Run `git log origin/dev..HEAD --oneline` — must be empty

**If any of these fail, DO NOT end the session.** Complete the cycle:

- Feedback given → Add to `Docs/Devlog/LEARNINGS-INBOX.md` (date, context, feedback)
- Duplicates in Inbox → Promote to `Docs/Devlog/LEARNINGS.md`, mark as promoted in Inbox
- Decision made → Add to `Docs/Devlog/DECISIONS.md` (use template)
- Missing changelog → Add one-line entry to `Docs/Devlog/CHANGELOG.md`
- Uncommitted → `git add -A; git commit -m "..."`
- Unpushed → `git push`

**Why this matters:** Unpushed work is lost if the local environment changes. Missing changelog entries make history unrecoverable. Uncaptured learnings mean repeated mistakes.

## Communication style for Cascade output

When responding in chat, always output in this structure:

1. What you understood (bullets)
2. What you will change (files + bullets)
3. Implementation notes (only what matters)
4. Verification you ran (exact commands) + results
5. Any spec/plan/tasks updates required
