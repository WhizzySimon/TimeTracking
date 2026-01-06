# Dialog and navigation bugs

**Date:** 2026-01-03
**Type:** [x] Bug / [ ] Behavior Change / [ ] Improvement

## Current Behavior

1. **Add-page wrong date:** Click on task → starts new task → navigates to day-page with wrong date (not today). Only when editing current task does page jump to today.
2. **Edit running task "Speichern":** Clicking "Speichern" doesn't close the dialog.

## Desired Behavior

1. Starting a task should navigate to day-page with today's date
2. "Speichern" should close the edit dialog after saving

## Analysis

### Issue 1: Wrong date after starting task

**Root cause:** `add/+page.svelte:87-88` sets `currentDate.set(now)` before navigating to `/day`, but `day/+page.svelte:250-273` has a `loadSavedDate()` function that runs in `onMount` and loads the previously saved date from IndexedDB.

The day-page checks `sessionStorage.getItem('date-navigation')` to determine whether to respect the current date or load the saved one. The add-page doesn't set this flag, so the saved date overwrites the "today" date.

**Fix:** Set `sessionStorage.setItem('date-navigation', 'true')` before navigating from add-page.

### Issue 2: "Speichern" not closing dialog

**Investigation:** `AddTaskModal.svelte:150-151` does call `onclose()` after saving. The code looks correct. Possible causes:

- Validation error preventing save (e.g., endTime <= startTime)
- User clicking "Speichern" while `saving` is true (button should be disabled)
- Some other async issue

**Needs manual testing** to reproduce and identify exact cause. Code structure suggests it should work.

## Changes Made

### Issue 1: Fixed

- **File:** `add/+page.svelte`
- **Change:** Added `sessionStorage.setItem('date-navigation', 'true')` before navigating to `/day`. This tells day-page to respect the current date instead of loading the saved date from IndexedDB.

### Issue 2: Needs investigation

Code review shows `AddTaskModal` should close after saving. Requires manual testing to identify the actual issue.

## QA Checklist

- [x] `npm run check` passes
- [ ] Issue 1: Manual test - start task from add-page, verify day-page shows today
- [ ] Issue 2: Manual test - edit running task, click Speichern, verify dialog closes

## Status: PARTIAL

**Issue 1:** Code fix implemented, needs verification.
**Issue 2:** Needs manual reproduction to identify actual cause.

<!-- Update to: DONE → VERIFIED → COMMITTED -->
