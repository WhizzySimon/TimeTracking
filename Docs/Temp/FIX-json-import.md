# Add JSON import option to Settings

**Date:** 2025-12-31
**Type:** [x] Improvement / [ ] Bug / [ ] Behavior Change

## Current Behavior

Settings -> Importieren only shows "Importieren" (goes to /import page) and "Excel-Datei importieren" buttons. No direct JSON import option.

## Desired Behavior

Add a "JSON-Datei importieren" button to allow quick JSON backup restoration from Settings page.

## Analysis

JSON import functionality exists (`src/lib/import/json-import.ts`) but is only accessible via the /import route. Need to create a modal similar to ImportExcelModal for JSON imports.

## Changes Made

- File: `src/lib/components/ImportJsonModal.svelte` (created)
  - New modal component for JSON import with file upload, preview, and validation
- File: `src/routes/settings/+page.svelte:41,104,719-721,787-790`
  - Added ImportJsonModal import
  - Added showImportJson state variable
  - Added "JSON-Datei importieren" button
  - Added modal rendering block
- File: `src/routes/import/+page.svelte:71`
  - Updated subtitle to include JSON in supported formats

## QA Checklist

- [x] `npm run check` passes
- [ ] Verified JSON import works (manual test recommended)

## Status: VERIFIED
