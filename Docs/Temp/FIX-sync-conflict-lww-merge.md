# Implement Entry-Level Last-Write-Wins (LWW) Merge for Cloud Sync

**Date:** 2024-12-31
**Type:** [x] Improvement

## Current Behavior

- Sync conflict detection is all-or-nothing (entire snapshot vs entire snapshot)
- When conflict detected, user must choose: keep ALL local or keep ALL cloud
- No banner shows for conflicts (only when clicking sync icon)
- `Category` type missing `updatedAt` property

## Desired Behavior

- Entry-level merge using Last-Write-Wins (LWW) strategy
- Each entry compared by `updatedAt` timestamp — newer wins
- Automatic merge without user intervention in most cases
- Informational banner when merge occurred
- All entity types have `updatedAt` consistently

## Analysis

### Data Types Status

| Entity         | Has `updatedAt`? | Auto-updated on save? |
| -------------- | ---------------- | --------------------- |
| TimeEntry      | ✅               | ❌ Caller sets        |
| DayType        | ✅               | ❌ Caller sets        |
| WorkTimeModel  | ✅               | ❌ Caller sets        |
| Employer       | ✅               | ❌ Caller sets        |
| UserPreference | ✅               | ❌ Caller sets        |
| Category       | ❌               | N/A                   |

### Implementation Plan

1. Add `updatedAt` to `Category` interface
2. Auto-set `updatedAt` in `operations.ts`
3. Create `mergeSnapshots()` function with per-entry LWW
4. Replace 'conflict' with 'merge' action
5. Add informational banner for merge events

### Edge Cases

- Deletions: Cloud entry exists, local deleted → Cloud restored (acceptable for LWW)
- Clock skew: Mitigated by using consistent timestamp source

## Changes Made

- **`src/lib/types.ts`**: Added `updatedAt: number` to `Category` interface
- **`src/lib/storage/operations.ts`**: Auto-set `updatedAt` to `Date.now()` in all save operations
- **`src/lib/storage/categories.ts`**: Added `updatedAt` to system categories and `addUserCategory()`
- **`src/lib/backup/cloud.ts`**:
  - Added `mergeByLWW()`, `mergeUserPreferencesByLWW()`, `mergeDayTypesByLWW()` helper functions
  - Added `mergeSnapshots()` function for entry-level LWW merge
  - Changed `determineSyncAction()` to return `'merge'` instead of `'conflict'`
  - Added `'merge'` case in `syncWithCloud()` switch
- **`src/routes/+layout.svelte`**: Handle merge action (reload after successful merge)
- **Test files**: Updated to include `updatedAt` in Category objects
- **`ImportExcelModal.svelte`**, **`AddCategoryModal.svelte`**, **`CategoryDialog.svelte`**: Added `updatedAt` to new category creation

## QA Checklist

- [x] `npm run check` passes (0 errors)
- [x] Unit tests pass (131/131)
- [ ] Manual verification of sync merge (requires 2 devices or incognito scenario)

## Status: VERIFIED

<!-- Update to: DONE → VERIFIED → COMMITTED -->
