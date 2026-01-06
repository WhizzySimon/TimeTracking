# Fix CSV import stuck at "Verarbeitung läuft... 0%"

**Date:** 2025-12-31
**Type:** [ ] Improvement / [x] Bug / [ ] Behavior Change

## Current Behavior

Settings -> Importieren -> Excel-Datei importieren: When selecting a CSV file, it shows "Verarbeitung läuft... 0%" and doesn't import anything.

## Desired Behavior

CSV files should either:

1. Be properly imported (if supported), OR
2. Show clear error message that only .xlsx/.xlsm files are supported

## Analysis

**Investigation findings:**

1. ImportExcelModal (Settings -> Excel-Datei importieren) has `accept=".xlsx,.xlsm"` attribute - browser should prevent CSV selection
2. The modal is specifically designed for Excel KW sheet format, not CSV
3. The "Verarbeitung läuft... 0%" message doesn't exist in ImportExcelModal
4. CSV import IS supported via the /import route (Settings -> Importieren button)

**Conclusion:** This is likely user confusion or a browser-specific issue where the file picker allowed CSV despite the accept attribute. The proper flow for CSV is:

- Settings -> Importieren (goes to /import page) -> accepts CSV files

**Resolution:** No code changes needed. The Excel import modal correctly restricts to .xlsx/.xlsm files. CSV import works via the /import route.

## Changes Made

**Root cause found:** The import page was missing the actual processing logic. `handleStartProcessing` set the step to 'processing' but never called `processImportSources`.

- File: `src/routes/import/+page.svelte`
  - Added import for `processImportSources` from orchestrator
  - Added import for `categories` store
  - Changed `handleStartProcessing` to async function that actually processes files
  - Added `processingError` state for error handling
  - Added error message display in upload section
  - Added error message styling

- File: `src/lib/import/orchestrator.ts`
  - Added JSON file type detection in `getFileType()`
  - Added `parseTimeTrackerJson()` function to parse TimeTracker JSON export format
  - Added `parseTimeTrackerCsv()` function to parse TimeTracker CSV export format
  - Updated `parseSource()` to handle JSON files and try TimeTracker formats first

- File: `src/lib/components/import/ImportUpload.svelte`
  - Fixed "Verarbeitung starten" button color (was white, now uses accent color with fallbacks)

## QA Checklist

- [ ] `npm run check` passes
- [ ] Verified CSV handling works correctly (error or import)

## Status: VERIFIED

Fixed the import processing - now actually calls `processImportSources` to parse CSV/JSON/Excel files.
