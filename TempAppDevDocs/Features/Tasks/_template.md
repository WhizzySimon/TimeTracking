# <feature-slug> - Tasks

**Phase:** <Phase-Nummer aus IMPLEMENTATION_PROGRESS.md>  
**Created:** YYYY-MM-DD  
**Last Updated:** YYYY-MM-DD  
**Based on Spec:** `TempAppDevDocs/Features/Specs/<feature-slug>.md`  
**Based on Plan:** `TempAppDevDocs/Features/Plans/<feature-slug>.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 0 - Baseline E2E Tests (MANDATORY)

**Run before starting any implementation work:**

```bash
npm run test:e2e
```

- Record which tests pass/fail as baseline
- If tests fail, note them — they are pre-existing issues, not caused by this feature
- This establishes regression baseline for Task N (final verification)

---

## Task 1 - [Brief description]

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `path/to/file.ts`
- **Done when:**
  - Specific completion criteria
- **Verify:**
  - `npm run check`
  - `npm run test`
- **Guardrails:**
  - Must not change X
  - Must preserve Y
- **Parallel:** [P] _(or blank if sequential)_
- **Estimated:** 0.5h / 1h / 2h

## Task 2 - [Brief description]

- **Before starting:** Read `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`
- **Files:**
  - `path/to/file.ts`
- **Done when:**
  - Specific completion criteria
- **Verify:**
  - `npm run check`
- **Guardrails:**
  - Must not change X
- **Parallel:**
- **Estimated:** 1h

---

## Task N - Final Verification & Audit (MANDATORY)

**Run after all implementation tasks are complete:**

### 1. E2E Regression Tests

```bash
npm run test:e2e
```

- Compare results to Task 0 baseline
- Any NEW failures = regressions caused by this feature (must fix)
- Pre-existing failures from Task 0 = acceptable (not caused by this feature)

### 2. Audit Bundle

- Create Evidence Bundle: `AuditBundles/AUD-YYYY-MM-DD-XX.md`
- Run `/audit` workflow
- Verify **PASS** before marking feature complete

### 3. Mark Complete

- Update `IMPLEMENTATION_PROGRESS.md` — mark feature as COMPLETE
- Final commit and push
