# Tasks: Code Quality Enforcement

**Created:** 2025-12-24  
**Plan:** `Docs/Plans/P08-code-quality.md`  
**Status:** Not Started

---

## Phase A — ESLint Complexity Rule

### Task A.1 — Add complexity rule (warning)

- **Files:** `eslint.config.js`
- **Done when:**
  - `complexity` rule added with `["warn", 20]`
  - `npm run lint` passes (warnings allowed)
- **Verify:** `npm run verify`
- **Guardrails:** Do not change any source code

### Task A.2 — Audit complexity warnings

- **Files:** None (analysis only)
- **Done when:**
  - List of functions exceeding complexity 20 documented
  - Decision made: fix or grandfather each
- **Verify:** Manual review
- **Guardrails:** Do not fix code yet, just document

### Task A.3 — Fix or grandfather violations

- **Files:** Source files with violations
- **Done when:**
  - Each violation either refactored or has inline disable with TODO
  - `npm run lint` passes with no warnings
- **Verify:** `npm run verify`
- **Guardrails:** Preserve existing behavior

### Task A.4 — Promote to error

- **Files:** `eslint.config.js`
- **Done when:**
  - `complexity` rule changed to `["error", 20]`
  - `npm run lint` passes
- **Verify:** `npm run verify`
- **Guardrails:** All violations must be resolved first

---

## Phase B — TypeScript Stricter Settings

### Task B.1 — Add noUnusedLocals

- **Files:** `tsconfig.json`
- **Done when:**
  - `"noUnusedLocals": true` added
  - `npm run check` passes (or violations fixed)
- **Verify:** `npm run verify`
- **Guardrails:** Use underscore prefix for intentionally unused vars

### Task B.2 — Add noUnusedParameters

- **Files:** `tsconfig.json`
- **Done when:**
  - `"noUnusedParameters": true` added
  - `npm run check` passes (or violations fixed)
- **Verify:** `npm run verify`
- **Guardrails:** Use underscore prefix for intentionally unused params

---

## Phase C — E2E Selector Stability

### Task C.1 — Audit getByText usage

- **Files:** `e2e/*.test.ts`
- **Done when:**
  - List of `getByText` calls documented
  - Each marked as: keep (stable) or replace (brittle)
- **Verify:** Manual review
- **Guardrails:** Do not change tests yet

### Task C.2 — Add data-testid attributes

- **Files:** `src/**/*.svelte` (as needed)
- **Done when:**
  - `data-testid` added for elements identified in C.1
  - No runtime behavior changes
- **Verify:** `npm run verify`, `npm run test:e2e`
- **Guardrails:** Do not change component logic

### Task C.3 — Replace brittle selectors

- **Files:** `e2e/*.test.ts`
- **Done when:**
  - Brittle `getByText` replaced with `getByTestId`
  - All E2E tests pass
- **Verify:** `npm run test:e2e`
- **Guardrails:** Tests must have same coverage

---

## Phase D — Documentation & CI

### Task D.1 — Document quality gates

- **Files:** `Docs/Guidelines/CODE_QUALITY_GATES.md` (new)
- **Done when:**
  - Quality gates documented with examples
  - Linked from INDEX.md
- **Verify:** Manual review
- **Guardrails:** Keep concise

### Task D.2 — Update CI workflow (if needed)

- **Files:** `.github/workflows/ci.yml`
- **Done when:**
  - All quality gates explicitly listed in CI
  - CI fails on any gate failure
- **Verify:** Push to branch, check CI
- **Guardrails:** Do not change existing passing behavior

---

## Summary

| Phase     | Tasks  | Estimated Time |
| --------- | ------ | -------------- |
| A         | 4      | 2-3 hours      |
| B         | 2      | 1 hour         |
| C         | 3      | 2-3 hours      |
| D         | 2      | 1 hour         |
| **Total** | **11** | **6-8 hours**  |

---

## Change Log

**[2025-12-24 19:55]**

- Created: Initial task breakdown for code quality enforcement
