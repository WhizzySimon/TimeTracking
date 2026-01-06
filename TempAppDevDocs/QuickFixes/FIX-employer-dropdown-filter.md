# Employer dropdown should not show "Alle Arbeitgeber"

**Date:** 2026-01-03
**Type:** [x] Bug / [ ] Behavior Change / [ ] Improvement

## Current Behavior

- Create task dialog: employer dropdown shows "Alle Arbeitgeber" option
- Week-page "Wochenart" dropdown: shows "Alle Arbeitgeber" option

## Desired Behavior

Employer dropdowns should only contain actual employers, not the filter option "Alle Arbeitgeber".

## Analysis

**Root cause:** Both `CategoryDialog.svelte` and `AddWorkTimeModelModal.svelte` include `<option value="">Alle Arbeitgeber</option>` in their employer dropdowns. This option is meant for filtering (like in `EmployerSelector.svelte`), not for creation/editing dialogs.

The validation logic already rejects empty `selectedEmployerId`, but the option shouldn't be visible in the first place.

**Note:** Week-page "Wochenart" dropdown (`WeekTypeSelector.svelte`) doesn't have an employer dropdown — it only has day type options. User may have meant a different component or this item doesn't apply.

## Changes Made

- **File(s):** `CategoryDialog.svelte`, `AddWorkTimeModelModal.svelte`
- **Change:** Replaced `<option value="">Alle Arbeitgeber</option>` with `<option value="" disabled>Arbeitgeber auswählen...</option>` in both employer dropdowns. This prevents selecting the placeholder option while making it clear what the dropdown is for.

## QA Checklist

- [x] `npm run check` passes
- [ ] Verified change works (manual test needed)

## Status: DONE

**Manual verification needed:** Open create task dialog and work time model dialog to confirm "Alle Arbeitgeber" is replaced with disabled placeholder.

<!-- Update to: DONE → VERIFIED → COMMITTED -->
