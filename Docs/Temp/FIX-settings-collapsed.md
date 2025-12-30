# Settings sections collapsed by default

**Date:** 2025-12-30
**Type:** [x] Behavior Change

## Current Behavior
Settings page sections (Arbeitgeber, Arbeitszeitmodell, Abwesenheitskategorien, Tätigkeiten) are expanded by default.

## Desired Behavior
All settings sections should be collapsed by default when the page loads.

## Analysis
The `expandedSections` state object in `src/routes/settings/+page.svelte` (lines 121-126) controls whether each section is expanded or collapsed. All four sections were initialized with `true`, making them expanded by default.

## Changes Made
- File(s): `src/routes/settings/+page.svelte`
- Change: Changed `expandedSections` initial state from all `true` to all `false` for employers, workTimeModels, abwesenheit, and arbeit sections 

## QA Checklist
- [x] `npm run check` passes
- [ ] Verified change works (manual or Playwright)

## Status: DONE
<!-- Update to: DONE → VERIFIED → COMMITTED -->
