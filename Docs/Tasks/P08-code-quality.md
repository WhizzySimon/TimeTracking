# Tasks: Code Quality Enforcement

**Created:** 2025-12-24  
**Plan:** `Docs/Plans/P08-code-quality.md`  
**Status:** Completed (2025-12-24)

---

## Phase A — ESLint Complexity Rule ✓

### Task A.1 — Add complexity rule (warning) ✓

- **Files:** `eslint.config.js`
- **Completed:** Added `complexity: ['warn', 20]`

### Task A.2 — Audit complexity warnings ✓

- **Findings:** 2 violations found:
  - `parseKWSheet` (complexity 22) in `src/lib/import/excelImport.ts`
  - `isWeekdayWorkday` (complexity 22) in `src/lib/utils/calculations.ts`
- **Decision:** Refactor both

### Task A.3 — Fix or grandfather violations ✓

- **Refactored:**
  - `isWeekdayWorkday`: Replaced 7-case switch with `WEEKDAY_PROPS` lookup table
  - `parseKWSheet`: Extracted `processKWSheetRow` helper function
- **Result:** 0 complexity warnings

### Task A.4 — Promote to error ✓

- **Completed:** Changed to `complexity: ['error', 20]`

---

## Phase B — TypeScript Stricter Settings ✓

### Task B.1 — Add noUnusedLocals ✓

- **Completed:** Added `"noUnusedLocals": true` to `tsconfig.json`

### Task B.2 — Add noUnusedParameters ✓

- **Completed:** Added `"noUnusedParameters": true` to `tsconfig.json`
- **Fixed:** Removed unused `fileInput` variable from `ImportExcelModal.svelte`

---

## Phase C — E2E Selector Stability ✓

### Task C.1-C.3 — Already compliant ✓

- **Audit result:** E2E tests already use `getByTestId` and `getByRole`
- **No `getByText` found** in any test file
- **No changes needed**

---

## Phase D — Documentation & CI ✓

### Task D.1 — Document quality gates ✓

- **Completed:** This task file serves as documentation
- **Quality gates enforced:**
  - ESLint complexity rule: `['error', 20]`
  - TypeScript: `noUnusedLocals`, `noUnusedParameters`
  - E2E: `getByTestId`/`getByRole` (already compliant)

### Task D.2 — Update CI workflow ✓

- **Result:** CI already runs `npm run verify` which includes all quality gates
- **No changes needed**

---

## Summary

| Phase | Status | Actual Time |
| ----- | ------ | ----------- |
| A     | Done   | ~30 min     |
| B     | Done   | ~10 min     |
| C     | Done   | ~5 min      |
| D     | Done   | ~10 min     |

**Total:** ~55 minutes (estimated 6-8 hours)

---

## Change Log

**[2025-12-24 19:55]**

- Created: Initial task breakdown for code quality enforcement

**[2025-12-24 20:55]**

- Completed: All phases A-D
- Phase A: Refactored `isWeekdayWorkday` and `parseKWSheet`
- Phase B: Added TypeScript strict settings, removed unused `fileInput`
- Phase C: Already compliant (no changes needed)
- Phase D: Updated this documentation
