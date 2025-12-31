# Fix: Standardize dialog buttons to Cancel + OK

**Date:** 2025-12-31
**Type:** [ ] Bug / [x] Behavior Change / [ ] Improvement

## Current Behavior

Dialog buttons use inconsistent labels like "Apply" or "Übernehmen" instead of standardized "Cancel" + "OK".

## Desired Behavior

1. All dialogs should use "Cancel" + "OK" buttons
2. Create UI guidelines document with this and other UI standards
3. UI guidelines creation process: web research → check existing patterns → compare → get user approval

## Analysis

Reviewed all ConfirmDialog usages. Most already use OK correctly. Found one instance using "Fortfahren" that should be "OK".

## Changes Made

- File(s):
  - `src/lib/components/WeekTypeSelector.svelte` - Changed confirmLabel from "Fortfahren" to "OK"
  - `Docs/DeveloperGuidesAndStandards/UI_GUIDELINES.md` - Created comprehensive UI guidelines
- Change: Standardized button labels and documented patterns

## QA Checklist

- [x] `npm run check` passes
- [x] All dialogs updated to Cancel + OK (or contextual for destructive actions)
- [x] UI guidelines document created
- [x] Verified changes work

## Status: VERIFIED
