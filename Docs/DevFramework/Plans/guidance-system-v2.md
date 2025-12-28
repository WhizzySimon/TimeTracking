# guidance-system-v2 — Plan

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/guidance-system-v2.md`

---

## Architecture / modules

This is a documentation refactoring — no code changes. The architecture involves file moves and content updates.

### File Changes Overview

| Current Location                                                   | Action               | New Location                          |
| ------------------------------------------------------------------ | -------------------- | ------------------------------------- |
| `.windsurf/rules/code-quality-rules.md` (94 lines)                 | Extract content      | `Docs/Rules/code-quality.md`          |
| `.windsurf/rules/code-quality-rules.md`                            | Replace with pointer | (10 lines)                            |
| `.windsurf/rules/ui-design-rules.md` (109 lines)                   | Extract content      | `Docs/Rules/ui-work.md`               |
| `.windsurf/rules/ui-design-rules.md`                               | Replace with pointer | (10 lines)                            |
| `.windsurf/rules/command-execution-rules.md` (16 lines)            | Keep as-is           | Already reference-only                |
| `.windsurf/rules/implementation-specification-rules.md` (41 lines) | Minor edit           | Remove any duplicated content         |
| `Docs/Rules/pre-commit.md`                                         | Add content          | Merge session-end checks + canary     |
| `Docs/Rules/session-end.md`                                        | Update               | Reference pre-commit, minimal content |
| Workflow files (3)                                                 | Fix references       | Replace `AGENTS.md` → `RULE_MAP.md`   |
| `.windsurf/cascade.md`                                             | Fix reference        | Replace `AGENTS.md` → `RULE_MAP.md`   |

### Dependencies

- No external dependencies
- No code dependencies
- Only documentation files affected

---

## Data model

Not applicable — no data changes.

---

## UI state model

Not applicable — no UI changes.

---

## Error handling

### What can go wrong?

| Risk                                  | Mitigation                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Cascade doesn't read the pointer file | Pointer format must be clear: "STOP. Read `Docs/Rules/X.md` before proceeding." |
| Content lost during move              | Verify line counts before/after; no content deletion without copy first         |
| Broken references                     | Grep for old file paths after changes; fix any remaining references             |

### Recovery

If implementation fails mid-way:

- Each task is atomic (one file at a time)
- Git history allows rollback
- No destructive changes — only moves and additions

---

## Testing strategy

### Manual verification

| Check                         | Command/Method                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| Line count `.windsurf/rules/` | Count lines in all 4 files; must be ≤60                              |
| No AGENTS.md references       | `grep -r "AGENTS.md" .windsurf/` returns empty                       |
| Canary appears                | Start new task, commit, verify `[CANARY]` in output                  |
| Rules still work              | Complete a task with UI changes, verify ConfirmDialog rules followed |

### Automated verification

| Check          | How                                                     |
| -------------- | ------------------------------------------------------- |
| File exists    | `test -f Docs/Rules/code-quality.md`                    |
| Pointer format | Grep for "Read `Docs/Rules/" in `.windsurf/rules/\*.md` |

### E2E test

Not applicable — this is framework configuration, not app functionality.

---

## Risks / constraints

| Risk                                  | Likelihood | Impact | Mitigation                                        |
| ------------------------------------- | ---------- | ------ | ------------------------------------------------- |
| Cascade ignores pointer files         | Low        | High   | Test immediately after first pointer is created   |
| Too many files in `Docs/Rules/`       | Low        | Low    | Already have 7 files; adding 2 more is acceptable |
| User confusion about where rules live | Medium     | Medium | Update `Docs/INDEX.md` to explain the structure   |

### Constraints

- `.windsurf/rules/` files cannot be edited by Cascade (platform limitation)
- Must preserve all existing rule content
- Changes must not break current workflows

---

## Implementation order

1. **Create new `Docs/Rules/` files first** (safe — only additions)
2. **Update pointer files in `.windsurf/rules/`** (replace content)
3. **Update `Docs/Rules/pre-commit.md`** (merge session-end + canary)
4. **Fix stale references** (AGENTS.md → RULE_MAP.md)
5. **Verify all acceptance checks**

This order ensures no content is lost — new files are created before old content is replaced.

---

## Change log

**[2025-12-27 14:25]**

- Added: Initial plan created
