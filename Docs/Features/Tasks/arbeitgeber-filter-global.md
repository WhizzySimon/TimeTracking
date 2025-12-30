# arbeitgeber-filter-global - Tasks

**Phase:** TBD (to be added to IMPLEMENTATION_PROGRESS.md)  
**Created:** 2024-12-30  
**Last Updated:** 2024-12-30  
**Based on Spec:** `Docs/Features/Specs/arbeitgeber-filter-global.md`  
**Based on Plan:** `Docs/Features/Plans/arbeitgeber-filter-global.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 1 - Audit all pages for unfiltered store usage

- **Files:**
  - `src/routes/day/+page.svelte`
  - `src/routes/week/+page.svelte`
  - `src/routes/month/+page.svelte`
  - `src/routes/analysis/+page.svelte`
- **Done when:**
  - All four pages audited for store usage
  - Document created listing all unfiltered store references found
  - Identified which stores need to be replaced with filtered equivalents
- **Verify:**
  - `grep -r "timeEntries" src/routes/{day,week,month,analysis}/+page.svelte`
  - `grep -r "categories" src/routes/{day,week,month,analysis}/+page.svelte`
  - `grep -r "workTimeModels" src/routes/{day,week,month,analysis}/+page.svelte`
  - `grep -r "activeWorkTimeModel" src/routes/{day,week,month,analysis}/+page.svelte`
  - `grep -r "runningEntry" src/routes/{day,week,month,analysis}/+page.svelte`
- **Guardrails:**
  - Must not modify any code yet (audit only)
  - Must check both store imports and store usage in template/script
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 2 - Fix Tag page to use filtered stores

- **Files:**
  - `src/routes/day/+page.svelte`
- **Done when:**
  - All unfiltered store references replaced with filtered equivalents
  - Imports updated to use filtered stores
  - All calculations use filtered data sources
  - Running task banner uses `filteredRunningEntry`
- **Verify:**
  - `npm run check`
  - Manual test: Select "Alle Arbeitgeber" → verify all entries visible
  - Manual test: Select specific employer → verify only that employer's entries visible
  - Manual test: Verify Ist/Soll/Saldo calculations correct for filtered data
- **Guardrails:**
  - Must not change calculation logic (only data sources)
  - Must preserve existing UI behavior
  - Must not break existing functionality
- **Parallel:**
- **Estimated:** 1h

---

## Task 3 - Fix Woche page to use filtered stores

- **Files:**
  - `src/routes/week/+page.svelte`
- **Done when:**
  - All unfiltered store references replaced with filtered equivalents
  - Imports updated to use filtered stores
  - All calculations use filtered data sources
  - Week summary uses filtered work time model
- **Verify:**
  - `npm run check`
  - Manual test: Select "Alle Arbeitgeber" → verify all entries visible
  - Manual test: Select specific employer → verify only that employer's entries visible
  - Manual test: Verify Ist/Soll/Saldo calculations correct for filtered data
  - Manual test: Verify day list shows only filtered entries
- **Guardrails:**
  - Must not change calculation logic (only data sources)
  - Must preserve existing UI behavior
  - Must not break existing functionality
- **Parallel:**
- **Estimated:** 1h

---

## Task 4 - Fix Monat page to use filtered stores

- **Files:**
  - `src/routes/month/+page.svelte`
- **Done when:**
  - All unfiltered store references replaced with filtered equivalents
  - Imports updated to use filtered stores
  - All calculations use filtered data sources
  - Month summary uses filtered work time model
- **Verify:**
  - `npm run check`
  - Manual test: Select "Alle Arbeitgeber" → verify all entries visible
  - Manual test: Select specific employer → verify only that employer's entries visible
  - Manual test: Verify Ist/Soll/Saldo calculations correct for filtered data
  - Manual test: Verify week list shows only filtered entries
- **Guardrails:**
  - Must not change calculation logic (only data sources)
  - Must preserve existing UI behavior
  - Must not break existing functionality
- **Parallel:**
- **Estimated:** 1h

---

## Task 5 - Fix Auswertung page to use filtered stores

- **Files:**
  - `src/routes/analysis/+page.svelte`
- **Done when:**
  - All unfiltered store references replaced with filtered equivalents
  - Imports updated to use filtered stores
  - All calculations use filtered data sources
  - Period summaries use filtered work time models
- **Verify:**
  - `npm run check`
  - Manual test: Select "Alle Arbeitgeber" → verify all entries visible
  - Manual test: Select specific employer → verify only that employer's entries visible
  - Manual test: Verify Ist/Soll/Saldo calculations correct for filtered data
  - Manual test: Verify period list shows only filtered entries
- **Guardrails:**
  - Must not change calculation logic (only data sources)
  - Must preserve existing UI behavior
  - Must not break existing functionality
- **Parallel:**
- **Estimated:** 1h

---

## Task 6 - Comprehensive Playwright testing

- **Files:**
  - All four page files (verification only)
- **Done when:**
  - All 15 acceptance checks from spec verified via Playwright or manual testing
  - Test results documented
  - Any issues found are fixed
- **Verify:**
  - AC-001 to AC-004: "Alle Arbeitgeber" shows all entries on all pages
  - AC-005 to AC-008: Specific employer shows only filtered entries on all pages
  - AC-009 to AC-012: Ist calculations use filtered data on all pages
  - AC-013: Soll calculation uses filtered work time model
  - AC-014: Running task banner filters correctly
  - AC-015: Filter changes update all pages immediately
- **Guardrails:**
  - Must test all edge cases from spec
  - Must verify reactive updates work without page refresh
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 7 - Update documentation and commit

- **Files:**
  - `Docs/Features/IMPLEMENTATION_PROGRESS.md`
  - `CHANGELOG.md` (if exists) or commit message
- **Done when:**
  - Progress tracker updated with new phase and all tasks marked complete
  - Spec status updated to "Implemented"
  - Commit message follows pre-commit rules
  - All changes committed and pushed
- **Verify:**
  - Follow `/commit` workflow or `DevFramework/JustInTimeAgentRules/pre-commit.md`
  - Verify all files staged
  - Verify commit message format correct
- **Guardrails:**
  - Must follow pre-commit checklist
  - Must update spec status to "Implemented"
- **Parallel:**
- **Estimated:** 0.5h

---

## Summary

**Total estimated time:** ~6.5h  
**Tasks:** 7 (1 audit + 4 fixes + 1 testing + 1 documentation)  
**Parallelizable:** None (sequential dependencies)
