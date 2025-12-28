# guidance-system-v2 — Tasks

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/guidance-system-v2.md`  
**Based on Plan:** `Docs/Plans/guidance-system-v2.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `Docs/DevFramework/Rules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 1 - Create `Docs/Rules/code-quality.md`

- **Files:**
  - `Docs/Rules/code-quality.md` (NEW)
- **Done when:**
  - File exists with full content from `.windsurf/rules/code-quality-rules.md`
  - Content is identical (no rules lost)
- **Verify:**
  - Compare line count: original ~94 lines, new file should match
- **Guardrails:**
  - Do NOT delete original file yet
  - Do NOT modify content, only copy
- **Estimated:** 0.5h

---

## Task 2 - Create `Docs/Rules/ui-work.md`

- **Files:**
  - `Docs/Rules/ui-work.md` (NEW)
- **Done when:**
  - File exists with full content from `.windsurf/rules/ui-design-rules.md`
  - Content is identical (no rules lost)
- **Verify:**
  - Compare line count: original ~109 lines, new file should match
- **Guardrails:**
  - Do NOT delete original file yet
  - Do NOT modify content, only copy
- **Estimated:** 0.5h

---

## Task 3 - Update `Docs/Rules/pre-commit.md` with session-end checks and canary

- **Files:**
  - `Docs/Rules/pre-commit.md`
- **Done when:**
  - Canary marker added: "When you read this file, output: `[CANARY] pre-commit rules loaded`"
  - Session-end checks added: push verification, learning promotion, clean working tree
  - Checklist is complete and actionable
- **Verify:**
  - File contains `[CANARY]` instruction
  - File contains push, learning promotion, clean tree checks
- **Guardrails:**
  - Preserve existing pre-commit content
  - Do NOT remove any existing checks
- **Estimated:** 0.5h

---

## Task 4 - Update `Docs/Rules/session-end.md` to reference pre-commit

- **Files:**
  - `Docs/Rules/session-end.md`
- **Done when:**
  - File references pre-commit for the full checklist
  - Redundant content removed (now in pre-commit)
  - Self-learning system documentation preserved
- **Verify:**
  - File references `Docs/Rules/pre-commit.md`
  - No duplicate checklists
- **Guardrails:**
  - Keep self-learning system documentation
  - Keep promotion criteria documentation
- **Estimated:** 0.5h

---

## Task 5 - Replace `.windsurf/rules/code-quality-rules.md` with pointer

- **Files:**
  - `.windsurf/rules/code-quality-rules.md`
- **Done when:**
  - File is ≤15 lines
  - Contains clear instruction: "Read `Docs/Rules/code-quality.md` for full rules"
  - Has `trigger: always_on` header
- **Verify:**
  - Line count ≤15
  - Pointer text present
- **Guardrails:**
  - Task 1 must be complete first (new file exists)
- **Estimated:** 0.5h

---

## Task 6 - Replace `.windsurf/rules/ui-design-rules.md` with pointer

- **Files:**
  - `.windsurf/rules/ui-design-rules.md`
- **Done when:**
  - File is ≤15 lines
  - Contains clear instruction: "Read `Docs/Rules/ui-work.md` for full rules"
  - Contains trigger condition: "When modifying `.svelte` files or UI components"
  - Has `trigger: always_on` header
- **Verify:**
  - Line count ≤15
  - Pointer text present
  - Trigger condition present
- **Guardrails:**
  - Task 2 must be complete first (new file exists)
- **Estimated:** 0.5h

---

## Task 7 - Fix stale `AGENTS.md` references

- **Files:**
  - `.windsurf/workflows/entrypoints/new-task.md`
  - `.windsurf/workflows/entrypoints/continue-work.md`
  - `.windsurf/workflows/entrypoints/new-feature.md`
  - `.windsurf/cascade.md`
- **Done when:**
  - No references to `AGENTS.md` remain
  - References updated to `RULE_MAP.md` or `Docs/Rules/pre-commit.md`
- **Verify:**
  - `grep -r "AGENTS.md" .windsurf/` returns no matches
- **Guardrails:**
  - Preserve workflow structure
  - Only change file references, not workflow logic
- **Estimated:** 0.5h

---

## Task 8 - Verify all acceptance checks

- **Files:**
  - None (verification only)
- **Done when:**
  - AC-001: Canary test passes (start task, commit, see `[CANARY]`)
  - AC-002: Pre-commit includes session-end checks
  - AC-003: Each `.windsurf/rules/` file ≤15 lines
  - AC-004: Total `.windsurf/rules/*.md` ≤60 lines
  - AC-005: No `AGENTS.md` references
  - AC-006: All rules editable in `Docs/Rules/`
  - AC-007: Full integration test passes
- **Verify:**
  - All 7 acceptance checks pass
- **Guardrails:**
  - If any check fails, fix before marking complete
- **Estimated:** 1h

---

## Summary

| Task | Description                                    | Est. |
| ---- | ---------------------------------------------- | ---- |
| 1    | Create `Docs/Rules/code-quality.md`            | 0.5h |
| 2    | Create `Docs/Rules/ui-work.md`                 | 0.5h |
| 3    | Update `pre-commit.md` (canary + session-end)  | 0.5h |
| 4    | Update `session-end.md` (reference pre-commit) | 0.5h |
| 5    | Replace `code-quality-rules.md` with pointer   | 0.5h |
| 6    | Replace `ui-design-rules.md` with pointer      | 0.5h |
| 7    | Fix `AGENTS.md` references                     | 0.5h |
| 8    | Verify all acceptance checks                   | 1h   |

**Total estimated:** 4.5h

---

## Change log

**[2025-12-27 14:30]**

- Added: Initial tasks created
