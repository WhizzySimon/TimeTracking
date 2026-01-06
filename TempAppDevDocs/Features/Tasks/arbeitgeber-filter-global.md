# arbeitgeber-filter-global - Tasks

**Phase:** A2.2  
**Created:** 2024-12-30  
**Last Updated:** 2025-12-31  
**Based on Spec:** `TempAppDevDocs/Features/Specs/arbeitgeber-filter-global.md`  
**Based on Plan:** `TempAppDevDocs/Features/Plans/arbeitgeber-filter-global.md`

---

## JIT Rules (MANDATORY)

**Follow the JIT rule map at each trigger point:** `DevFramework/JustInTimeAgentRules/_entrypoint-jit-rule-map.md`

Key triggers during task execution: writing code, before commit, session end.

---

## Task 1 - Add neverAddedAnEntry flag to user store

- **Files:**
  - `src/lib/stores/user.ts`
- **Done when:**
  - `neverAddedAnEntry` writable store added
  - `loadNeverAddedAnEntry()` function loads from localStorage (default: `true`)
  - `setNeverAddedAnEntry(value: boolean)` function persists to localStorage
  - Migration logic: if user has existing entries, set to `false`
- **Verify:**
  - `npm run check`
  - Manual: New user sees `true`, existing user with entries sees `false`
- **Guardrails:**
  - Must not break existing user store functionality
  - Must handle missing localStorage gracefully (SSR)
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 2 - Update entry creation to set neverAddedAnEntry=false

- **Files:**
  - `src/lib/storage/operations.ts`
  - `src/routes/add/+page.svelte` (handleCategorySelect)
- **Done when:**
  - `saveTimeEntry()` or entry creation calls `setNeverAddedAnEntry(false)`
  - Flag is set atomically when first entry is created
- **Verify:**
  - `npm run check`
  - Manual: Create first entry → flag becomes `false`
- **Guardrails:**
  - Must not break existing entry creation
  - Must only set flag, not read it during creation
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 3 - Add Page: Remove titles and bottom button

- **Files:**
  - `src/routes/add/+page.svelte`
- **Done when:**
  - `<h1>Aufgabe starten</h1>` removed
  - Bottom "Kategorie erstellen" button removed
- **Verify:**
  - `npm run check`
  - Visual: No "Aufgabe starten" title, no bottom button
- **Guardrails:**
  - Must keep CategoryList component
  - Must keep CategoryDialog functionality
- **Parallel:**
- **Estimated:** 0.25h

---

## Task 4 - CategoryList: Remove "Alle Kategorien" heading, rename to "Eintrag"

- **Files:**
  - `src/lib/components/CategoryList.svelte`
- **Done when:**
  - "Alle Kategorien" section title removed
  - "Kategorie erstellen" button text changed to "Eintrag erstellen" (no plus icon)
  - Any other "Kategorie" labels changed to "Eintrag"
- **Verify:**
  - `npm run check`
  - Visual: No "Alle Kategorien" heading, button says "Eintrag erstellen"
- **Guardrails:**
  - Must preserve category selection functionality
  - Must preserve employer grouping logic
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 5 - CategoryList: Filter input max 50% width + button layout

- **Files:**
  - `src/lib/components/CategoryList.svelte`
- **Done when:**
  - Filter input has `max-width: 50%`
  - "Eintrag erstellen" button is in same row, next to filter input
  - Layout is responsive (stacks on very small screens if needed)
- **Verify:**
  - `npm run check`
  - Visual: Filter ≤50% width, button next to it
- **Guardrails:**
  - Must not break filter functionality
  - Must remain accessible
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 6 - Add Page: First-time hint for new users

- **Files:**
  - `src/routes/add/+page.svelte`
- **Done when:**
  - Import `neverAddedAnEntry` from user store
  - Show hint "Klicke auf einen Eintrag, um die Zeit zu starten" if `$neverAddedAnEntry === true`
  - Hint appears under title bar area, styled subtly
- **Verify:**
  - `npm run check`
  - Manual: New user sees hint, existing user does not
- **Guardrails:**
  - Must not show hint after first entry created
  - Must be dismissible by creating entry (not manual dismiss)
- **Parallel:**
- **Estimated:** 0.5h

---

## Task 7 - TaskList: Add employer badge / "Keine Arbeitszeit" badge

- **Files:**
  - `src/lib/components/TaskList.svelte`
- **Done when:**
  - Entries with `countsAsWorkTime === true` show employer badge (employer name)
  - Entries with `countsAsWorkTime === false` show "Keine Arbeitszeit" badge
  - Badge styling consistent with existing UI
- **Verify:**
  - `npm run check`
  - Visual: Tätigkeiten show employer name, Abwesenheiten show "Keine Arbeitszeit"
- **Guardrails:**
  - Must pass categories and employers as props if not already available
  - Must not break existing task list functionality
- **Parallel:**
- **Estimated:** 1h

---

## Task 8 - Verify employer filtering on Tag/Monat/Auswertung pages

- **Files:**
  - `src/routes/day/+page.svelte`
  - `src/routes/month/+page.svelte`
  - `src/routes/analysis/+page.svelte`
- **Done when:**
  - All pages use filtered stores (`filteredEntries`, `filteredCategories`, etc.)
  - Abwesenheiten remain visible regardless of employer filter
  - Any unfiltered store usage fixed
- **Verify:**
  - `npm run check`
  - Grep for unfiltered store usage
  - Manual: Filter by employer → correct data shown
- **Guardrails:**
  - Must not change calculation logic
  - Must preserve existing UI behavior
- **Parallel:**
- **Estimated:** 1h

---

## Task 9 - Playwright testing for all acceptance checks

- **Files:**
  - `AutomatedUITests/` (new or existing test file)
- **Done when:**
  - AC-001 to AC-014 verified via Playwright or manual testing
  - Test results documented
- **Verify:**
  - All acceptance checks pass
- **Guardrails:**
  - Must test edge cases (empty state, running task filter, etc.)
- **Parallel:**
- **Estimated:** 1.5h

---

## Task 10 - Update documentation and commit

- **Files:**
  - `TempAppDevDocs/Features/IMPLEMENTATION_PROGRESS.md`
  - `TempAppDevDocs/Features/Specs/arbeitgeber-filter-global.md` (status → Implemented)
- **Done when:**
  - Progress tracker updated with phase and all tasks marked complete
  - Spec status updated to "Implemented"
  - Commit follows pre-commit rules
- **Verify:**
  - Follow `DevFramework/JustInTimeAgentRules/pre-commit.md`
- **Guardrails:**
  - Must follow pre-commit checklist
- **Parallel:**
- **Estimated:** 0.5h

---

## Summary

**Total estimated time:** ~7h  
**Tasks:** 10  
**Parallelizable:** Tasks 3-6 can run in parallel (Add page UI changes)
