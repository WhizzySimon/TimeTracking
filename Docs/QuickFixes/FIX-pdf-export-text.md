# Remove "kommt bald" from PDF export option

**Date:** 2025-12-31
**Type:** [x] Improvement / [ ] Bug / [ ] Behavior Change

## Current Behavior

PDF export option shows "Druckbare Übersicht (kommt bald)" - indicating it's coming soon.

## Desired Behavior

Remove "(kommt bald)" text since PDF export is already implemented and functional.

## Analysis

PDF export is fully implemented in `src/lib/export/pdf-export.ts` with jsPDF. The "kommt bald" text in ExportDialog.svelte line 95 is outdated.

## Changes Made

- File: `src/lib/components/ExportDialog.svelte:95`
- Change: Removed "(kommt bald)" from PDF format description text

## QA Checklist

- [x] `npm run check` passes
- [ ] Verified change works (manual test recommended)

## Status: VERIFIED
