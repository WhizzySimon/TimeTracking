# Implementation Rules

**Trigger:** Before starting to implement code

---

## Canary

**When you read this file, output exactly:**

> [CANARY] implementation rules loaded

---

## Refactoring Rules

- **When refactoring or migrating code:** Always notify if any functionality is NOT being copied
- **Preserve behavior:** Existing working behavior must be preserved unless spec explicitly changes it

---

## Pre-Implementation Gates

Before starting implementation, verify all gates pass:

- [ ] **Simplicity:** ≤3 new files for initial implementation?
- [ ] **Anti-Abstraction:** Using framework directly, no unnecessary wrappers?
- [ ] **Integration-First:** Contracts/interfaces defined before implementation?
- [ ] **Scope-Lock:** No new requirements added since spec approval?
- [ ] **Test-Ready:** At least one acceptance check is automatable?

If any gate fails, update the spec/plan/tasks first.

---

## Implementation Rules

- Implement tasks strictly in order unless the tasks doc is updated first
- Prefer minimal diffs and incremental commits
- Do not introduce new dependencies unless the plan explicitly calls for it
- Preserve existing working behavior unless the spec explicitly changes it
- If something is unclear during coding, STOP and update the spec/plan/tasks first

## Coding Rules

- Do not do broad refactors "for cleanliness" unless explicitly tasked
- If you change behavior, update acceptance criteria and tests
- Prefer pure functions + small modules over large multi-purpose files
- Avoid hidden coupling: pass data explicitly; document invariants

## PWA / Platform Constraints

- Follow the repo's PWA/SvelteKit/platform rules exactly as documented
- If a requirement conflicts with browser constraints, document the constraint in the spec and propose the smallest viable alternative

## Command Execution

**Use the integrated PowerShell terminal** (`run_command` tool) for all commands.

The Cascade Watcher is deprecated and only used as fallback if the integrated terminal doesn't work.
See `Docs/DevFramework/Tooling/CASCADE_WATCHER.md` for fallback instructions.

## Verification

Before marking any task complete:

- Use the repo's actual scripts from package.json (do not invent commands)
- Run the fastest relevant checks first (format/lint/typecheck), then tests
- If e2e exists (e.g., Playwright), run only the impacted suite when possible

When reporting completion:

- State exactly what you ran and what passed
- If you could not run something, state why (missing script, environment, etc.)

---

## Definition of Done for a Task

- Code changes completed
- Verification executed
- Notes written back into the relevant spec/plan/tasks if reality differed from assumptions
- Git commit & push (see `Docs/DevFramework/JustInTimeAgentRules/pre-commit.md`)

---

**Next:** Before committing → Read `Docs/DevFramework/JustInTimeAgentRules/pre-commit.md`
