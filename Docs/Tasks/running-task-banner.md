# running-task-banner - Tasks

**Phase:** P12  
**Created:** 2025-12-27  
**Last Updated:** 2025-12-27  
**Based on Spec:** `Docs/Specs/running-task-banner.md`  
**Based on Plan:** `Docs/Plans/running-task-banner.md`

---

## Task 1 - Update runningEntry store to return oldest running task

- **Files:**
  - `src/lib/stores/index.ts`
- **Done when:**
  - `runningEntry` derived store returns the OLDEST running task (by `createdAt`)
  - Add `runningEntries` derived store that returns ALL running tasks sorted by `createdAt`
- **Verify:**
  - `npm run check`
- **Guardrails:**
  - Must not break existing consumers of `runningEntry`
  - Sorting must be ascending (oldest first)
- **Parallel:** [P]
- **Estimated:** 0.5h

## Task 2 - Add click handler to WarningBanner component

- **Files:**
  - `src/lib/components/WarningBanner.svelte`
- **Done when:**
  - Banner accepts optional `onclick` prop
  - When `onclick` provided, cursor changes to pointer
  - Click triggers the handler
- **Verify:**
  - `npm run check`
- **Guardrails:**
  - Must remain backward compatible (onclick optional)
  - No visual changes except cursor
- **Parallel:** [P]
- **Estimated:** 0.5h

## Task 3 - Move banner to global layout

- **Files:**
  - `src/routes/+layout.svelte`
  - `src/routes/day/+page.svelte` (remove banner from here)
- **Done when:**
  - Banner rendered in `+layout.svelte` for all authenticated routes
  - Banner removed from `/day` page (avoid duplicate)
  - Banner only shows when `runningEntry` exists
- **Verify:**
  - `npm run check`
  - Manual: Visit /day, /add, /analysis, /settings - banner visible on all
- **Guardrails:**
  - Must not show banner on login/signup pages
  - Position: after header, before main content
- **Parallel:**
- **Estimated:** 0.5h

## Task 4 - Implement banner click navigation

- **Files:**
  - `src/routes/+layout.svelte`
- **Done when:**
  - Clicking banner calls `goto('/day')` with entry's date
  - Sets `currentDate` store to the running task's date
  - Sets URL param or store to indicate which entry to edit
- **Verify:**
  - `npm run check`
  - Manual: Click banner, verify navigation to correct date
- **Guardrails:**
  - Use SvelteKit's `goto()` function
  - No browser dialogs
- **Parallel:**
- **Estimated:** 0.5h

## Task 5 - Open AddTaskModal for running task after navigation

- **Files:**
  - `src/routes/day/+page.svelte`
- **Done when:**
  - After navigating from banner click, AddTaskModal opens automatically
  - Modal pre-filled with the running task's data
  - User can set end time and save
- **Verify:**
  - `npm run check`
  - Manual: Click banner, verify modal opens with correct task
- **Guardrails:**
  - Modal must close cleanly
  - Must handle case where entry no longer exists
- **Parallel:**
- **Estimated:** 1h

## Task 6 - Verify sequential task resolution

- **Files:**
  - (Testing only, no new files)
- **Done when:**
  - With 2 running tasks (A older, B newer):
    - Banner shows A
    - Ending A shows B
    - Ending B removes banner
- **Verify:**
  - Manual testing with multiple running tasks
  - E2E test for AC-103, AC-104, AC-105
- **Guardrails:**
  - No page reload required for banner update
- **Parallel:**
- **Estimated:** 0.5h

## Task 7 - Add E2E tests

- **Files:**
  - `e2e/running-task-banner.test.ts` (new)
- **Done when:**
  - Tests cover AC-100 through AC-106
  - All tests pass
- **Verify:**
  - `npm run test:e2e`
- **Guardrails:**
  - Tests must be stable (no flaky timing issues)
- **Parallel:**
- **Estimated:** 1h

---

## Summary

| Task | Description                        | Est. | Parallel |
| ---- | ---------------------------------- | ---- | -------- |
| 1    | Update runningEntry store          | 0.5h | [P]      |
| 2    | Add click handler to WarningBanner | 0.5h | [P]      |
| 3    | Move banner to global layout       | 0.5h |          |
| 4    | Implement banner click navigation  | 0.5h |          |
| 5    | Open AddTaskModal after navigation | 1h   |          |
| 6    | Verify sequential task resolution  | 0.5h |          |
| 7    | Add E2E tests                      | 1h   |          |

**Total estimated:** 4.5h
