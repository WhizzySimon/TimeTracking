# Box: Refactor

**Risk Class:** low (rename/move) | medium (restructure) | high (architecture change)

---

## When to Use

- Code restructuring without behavior change
- Renaming files, functions, or variables
- Extracting components or modules
- Consolidating duplicate code
- Improving code organization

---

## Acceptance Criteria Format

All acceptance criteria for refactors MUST:

- Confirm NO behavior change (same inputs → same outputs)
- List structural changes made
- Verify all existing tests still pass

**Example:**
```
AC-001: Extract time calculation logic from DayTab.svelte to src/lib/time/calculations.ts
AC-002: DayTab.svelte imports from new location
AC-003: All existing unit tests pass unchanged
AC-004: E2E tests pass unchanged (behavior identical)
```

---

## Required Verification Commands

| Command | Required | Notes |
|---------|----------|-------|
| `npm run verify` | ✅ Yes | Format + TypeScript + Lint |
| `npm run test:unit` | ✅ Yes | All tests must pass |
| `npm run test:e2e` | ✅ Yes | Behavior must be unchanged |
| Browser test (MCP) | ⚠️ Optional | Only if UI touched |

---

## Evidence Bundle Requirements

- [ ] Box type: `refactor`
- [ ] Anomaly check passed (`npm run ai:detect-anomalies` shows 0 critical)
- [ ] What was restructured (before/after summary)
- [ ] Confirmation: NO behavior change
- [ ] Changed files list
- [ ] `npm run verify` output
- [ ] `npm run test:unit` output (all pass)
- [ ] `npm run test:e2e` output (all pass)

---

## High-Risk Escalation

If risk class is **high** (architecture change):

- [ ] Create a Plan document before starting
- [ ] Break into smaller incremental refactors
- [ ] Run full test suite after each step
- [ ] Consider feature flag for large changes
- [ ] Review with fresh eyes before commit

---

## Common Failure Patterns

| Pattern | Prevention |
|---------|------------|
| Accidental behavior change | Run tests after every small change |
| Renaming breaks imports | Use IDE rename refactoring |
| Forgetting to update tests | Search for old names in test files |
| Too big a change | Break into multiple commits |
| Mixing refactor with features | Do ONE thing per commit |

---

## Refactor Discipline

1. **Tests first:** Ensure tests exist before refactoring
2. **Small steps:** One rename, one extract, one move at a time
3. **Verify often:** Run `npm run verify` after each step
4. **No new features:** Refactor commits are ONLY structural
5. **Commit message:** Use `refactor:` prefix
