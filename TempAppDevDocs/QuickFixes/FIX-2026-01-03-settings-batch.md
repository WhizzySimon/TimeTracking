# Settings Page Batch Fixes

**Date:** 2026-01-03
**Type:** [x] Bug / [ ] Behavior Change / [ ] Improvement

## Issues

### Issue 1: Dialog close delay on "Speichern"

**Current:** CategoryDialog closes after delay when clicking "Speichern"
**Desired:** Dialog should close immediately

### Issue 2: Employer filter not working for Tätigkeiten in Settings

**Current:** When selecting an employer in header dropdown, Settings page still shows all categories
**Desired:** Tätigkeiten section should filter by selected employer

### Issue 3: Employer dropdown not populating until visiting Add page

**Current:** Employer dropdown shows no options until user visits Add page
**Desired:** Employers should load on app startup in +layout.svelte

### Issue 4: Import Excel dialog missing employer selection

**Current:** No way to select which employer imported time data belongs to
**Desired:** Add employer dropdown to ImportExcelModal (TimeEntry already has employerId property)

## Analysis

1. **Issue 1:** CategoryDialog doesn't have a delay - the issue is likely in the Settings page's `onsave` callback which doesn't close immediately.

2. **Issue 2:** Settings page uses `$categories` directly instead of `$filteredCategories` for the Tätigkeiten section.

3. **Issue 3:** The `employers` store is only populated in Add page's `onMount`. The +layout.svelte doesn't load employers on startup.

4. **Issue 4:** ImportExcelModal creates TimeEntries without employerId. Need to add employer selection dropdown.

## Changes Made

- **`src/routes/+layout.svelte`**: Load employers on app startup so header dropdown populates immediately
- **`src/routes/settings/+page.svelte`**: Use `filteredCategories` for Tätigkeiten section when employer is selected
- **`src/lib/components/CategoryDialog.svelte`**: Close dialog immediately on save, persist to DB in background
- **`src/lib/components/ImportExcelModal.svelte`**: Add employer selection dropdown for imported time data

## QA Checklist

- [x] `npm run check` passes
- [x] Verified change works (Playwright browser test)

## Status: VERIFIED
